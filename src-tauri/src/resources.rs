use crate::k8s_client;
use crate::kubectl::run_kubectl_command;
use k8s_openapi::api::apps::v1::{DaemonSet, Deployment, StatefulSet};
use k8s_openapi::api::batch::v1::{CronJob, Job};
use k8s_openapi::api::core::v1::{ConfigMap, Event, Node, Pod, Secret, Service, ServiceAccount};
use k8s_openapi::api::rbac::v1::{Role, RoleBinding};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "kind")]
pub enum KubeResource {
    Pod(Pod),
    Deployment(Deployment),
    StatefulSet(StatefulSet),
    DaemonSet(DaemonSet),
    Node(Node),
    Job(Job),
    CronJob(CronJob),
    ConfigMap(ConfigMap),
    Secret(Secret),
    Service(Service),
    ServiceAccount(ServiceAccount),
    Role(Role),
    RoleBinding(RoleBinding),
}

#[derive(Debug, Serialize, Deserialize)]
#[serde()]
pub enum ResourceType {
    Pod,
    Deployment,
    DaemonSet,
    StatefulSet,
    Job,
    CronJob,
    Service,
    Node,
    ConfigMap,
    Secret,
    ServiceAccount,
    Role,
    RoleBinding,
}

impl ResourceType {
    fn as_str(&self) -> &'static str {
        match self {
            ResourceType::Pod => "pod",
            ResourceType::Deployment => "deployment",
            ResourceType::DaemonSet => "daemonset",
            ResourceType::StatefulSet => "statefulset",
            ResourceType::Job => "job",
            ResourceType::CronJob => "cronjob",
            ResourceType::Service => "service",
            ResourceType::Node => "node",
            ResourceType::ConfigMap => "configmap",
            ResourceType::Secret => "secret",
            ResourceType::ServiceAccount => "serviceaccount",
            ResourceType::Role => "role",
            ResourceType::RoleBinding => "rolebinding",
        }
    }

    fn kind(&self) -> &'static str {
        match self {
            ResourceType::Pod => "Pod",
            ResourceType::Deployment => "Deployment",
            ResourceType::DaemonSet => "DaemonSet",
            ResourceType::StatefulSet => "StatefulSet",
            ResourceType::Job => "Job",
            ResourceType::CronJob => "CronJob",
            ResourceType::Service => "Service",
            ResourceType::Node => "Node",
            ResourceType::ConfigMap => "ConfigMap",
            ResourceType::Secret => "Secret",
            ResourceType::ServiceAccount => "ServiceAccount",
            ResourceType::Role => "Role",
            ResourceType::RoleBinding => "RoleBinding",
        }
    }
}

// delete a resource by name in a namespace
#[tauri::command]
pub async fn delete_resource(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: ResourceType,
    name: String,
) -> Result<(), String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    match resource_type {
        ResourceType::Pod => k8s_client::delete_resource::<Pod>(client, &namespace, &name).await,
        ResourceType::Deployment => {
            k8s_client::delete_resource::<Deployment>(client, &namespace, &name).await
        }
        ResourceType::StatefulSet => {
            k8s_client::delete_resource::<StatefulSet>(client, &namespace, &name).await
        }
        ResourceType::DaemonSet => {
            k8s_client::delete_resource::<DaemonSet>(client, &namespace, &name).await
        }
        ResourceType::Job => k8s_client::delete_resource::<Job>(client, &namespace, &name).await,
        ResourceType::CronJob => {
            k8s_client::delete_resource::<CronJob>(client, &namespace, &name).await
        }
        ResourceType::Node => k8s_client::delete_cluster_resource::<Node>(client, &name).await,
        ResourceType::ConfigMap => {
            k8s_client::delete_resource::<ConfigMap>(client, &namespace, &name).await
        }
        ResourceType::Secret => {
            k8s_client::delete_resource::<Secret>(client, &namespace, &name).await
        }
        ResourceType::Service => {
            k8s_client::delete_resource::<Service>(client, &namespace, &name).await
        }
        ResourceType::ServiceAccount => {
            k8s_client::delete_resource::<ServiceAccount>(client, &namespace, &name).await
        }
        ResourceType::Role => {
            k8s_client::delete_resource::<Role>(client, &namespace, &name).await
        }
        ResourceType::RoleBinding => {
            k8s_client::delete_resource::<RoleBinding>(client, &namespace, &name).await
        }
    }
}

#[tauri::command]
pub async fn open_resource_events_in_terminal(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: ResourceType,
    name: String,
) -> Result<(), String> {
    // if namespace is empty, use all namespaces
    let namespace = if namespace.is_empty() {
        "--all-namespaces".to_string()
    } else {
        format!("-n {}", namespace)
    };

    let cmd_string = format!(
        "--kubeconfig {} --context {} get events {} --field-selector involvedObject.name={},involvedObject.kind={}",
        kubeconfig_path, context, namespace, name, resource_type.kind()
    );
    run_kubectl_command(&cmd_string)?;
    Ok(())
}

#[tauri::command]
pub async fn open_resource_logs_in_terminal(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: ResourceType,
    name: String,
    container_name: Option<String>,
) -> Result<(), String> {
    // Base command with common parameters
    let mut cmd_string = format!(
        "--kubeconfig {} --context {} logs -n {}",
        kubeconfig_path, context, namespace,
    );

    // Add resource-specific flags
    cmd_string = match resource_type {
        ResourceType::Deployment => format!("{} -f deployment/{} --all-pods", cmd_string, name),
        ResourceType::StatefulSet => format!("{} -f statefulset/{} --all-pods", cmd_string, name),
        ResourceType::DaemonSet => format!("{} -f daemonset/{} --all-pods", cmd_string, name),
        ResourceType::Job => format!("{} job/{}", cmd_string, name),
        ResourceType::CronJob => format!("{} cronjob/{}", cmd_string, name),
        ResourceType::Pod => format!("{} {}", cmd_string, name),
        _ => {
            return Err(format!(
                "Unsupported resource type for logs: {:?}",
                resource_type
            ))
        }
    };

    // Add container specification if provided
    cmd_string = match container_name {
        None => format!("{} --all-containers", cmd_string),
        Some(ref c) if c.is_empty() => format!("{} --all-containers", cmd_string),
        Some(c) => format!("{} -c {}", cmd_string, c),
    };

    // Execute the command
    run_kubectl_command(&cmd_string)?;
    Ok(())
}

// get a resource by name in a namespace
#[tauri::command]
pub async fn get_resource(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: ResourceType,
    name: String,
) -> Result<KubeResource, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    match resource_type {
        ResourceType::Pod => {
            let resource = k8s_client::get_resource::<Pod>(client, &namespace, &name).await?;
            Ok(KubeResource::Pod(resource))
        }
        ResourceType::Deployment => {
            let resource =
                k8s_client::get_resource::<Deployment>(client, &namespace, &name).await?;
            Ok(KubeResource::Deployment(resource))
        }
        ResourceType::StatefulSet => {
            let resource =
                k8s_client::get_resource::<StatefulSet>(client, &namespace, &name).await?;
            Ok(KubeResource::StatefulSet(resource))
        }
        ResourceType::DaemonSet => {
            let resource = k8s_client::get_resource::<DaemonSet>(client, &namespace, &name).await?;
            Ok(KubeResource::DaemonSet(resource))
        }
        ResourceType::Job => {
            let resource = k8s_client::get_resource::<Job>(client, &namespace, &name).await?;
            Ok(KubeResource::Job(resource))
        }
        ResourceType::CronJob => {
            let resource = k8s_client::get_resource::<CronJob>(client, &namespace, &name).await?;
            Ok(KubeResource::CronJob(resource))
        }
        ResourceType::Node => {
            let resource = k8s_client::get_cluster_resource::<Node>(client, &name).await?;
            Ok(KubeResource::Node(resource))
        }
        ResourceType::ConfigMap => {
            let resource = k8s_client::get_resource::<ConfigMap>(client, &namespace, &name).await?;
            Ok(KubeResource::ConfigMap(resource))
        }
        ResourceType::Secret => {
            let resource = k8s_client::get_resource::<Secret>(client, &namespace, &name).await?;
            Ok(KubeResource::Secret(resource))
        }
        ResourceType::Service => {
            let resource = k8s_client::get_resource::<Service>(client, &namespace, &name).await?;
            Ok(KubeResource::Service(resource))
        }
        ResourceType::ServiceAccount => {
            let resource = k8s_client::get_resource::<ServiceAccount>(client, &namespace, &name).await?;
            Ok(KubeResource::ServiceAccount(resource))
        }
        ResourceType::Role => {
            let resource = k8s_client::get_resource::<Role>(client, &namespace, &name).await?;
            Ok(KubeResource::Role(resource))
        }
        ResourceType::RoleBinding => {
            let resource = k8s_client::get_resource::<RoleBinding>(client, &namespace, &name).await?;
            Ok(KubeResource::RoleBinding(resource))
        }
    }
}

// list a resource by name in a namespace
#[tauri::command]
pub async fn list_resource(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: ResourceType,
) -> Result<Vec<KubeResource>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    match resource_type {
        ResourceType::Pod => {
            let resources = k8s_client::list_resources::<Pod>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::Pod).collect())
        }
        ResourceType::Deployment => {
            let resources = k8s_client::list_resources::<Deployment>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::Deployment).collect())
        }
        ResourceType::StatefulSet => {
            let resources = k8s_client::list_resources::<StatefulSet>(client, &namespace).await?;
            Ok(resources
                .into_iter()
                .map(KubeResource::StatefulSet)
                .collect())
        }
        ResourceType::DaemonSet => {
            let resources = k8s_client::list_resources::<DaemonSet>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::DaemonSet).collect())
        }
        ResourceType::Job => {
            let resources = k8s_client::list_resources::<Job>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::Job).collect())
        }
        ResourceType::CronJob => {
            let resources = k8s_client::list_resources::<CronJob>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::CronJob).collect())
        }
        ResourceType::Node => {
            // For nodes, we ignore the namespace parameter since they are cluster-scoped
            let resources = k8s_client::list_cluster_resources::<Node>(client).await?;
            Ok(resources.into_iter().map(KubeResource::Node).collect())
        }
        ResourceType::ConfigMap => {
            let resources = k8s_client::list_resources::<ConfigMap>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::ConfigMap).collect())
        }
        ResourceType::Secret => {
            let resources = k8s_client::list_resources::<Secret>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::Secret).collect())
        }
        ResourceType::Service => {
            let resources = k8s_client::list_resources::<Service>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::Service).collect())
        }
        ResourceType::ServiceAccount => {
            let resources = k8s_client::list_resources::<ServiceAccount>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::ServiceAccount).collect())
        }
        ResourceType::Role => {
            let resources = k8s_client::list_resources::<Role>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::Role).collect())
        }
        ResourceType::RoleBinding => {
            let resources = k8s_client::list_resources::<RoleBinding>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::RoleBinding).collect())
        }
    }
}

// scale a resource by name in a namespace
// this will only be allowed for resources that support scaling
#[tauri::command]
pub async fn scale_resource(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: ResourceType,
    name: String,
    current_replicas: i32,
    replicas: i32,
) -> Result<(), String> {
    match resource_type {
        ResourceType::Deployment | ResourceType::StatefulSet => {
            let cmd_string = format!(
                "--kubeconfig {} --context {} scale {} {} -n {} --current-replicas={} --replicas={}",
                kubeconfig_path,
                context,
                resource_type.as_str(),
                name,
                namespace,
                current_replicas,
                replicas,
            );
            run_kubectl_command(&cmd_string)?;
            Ok(())
        }
        _ => Err(format!(
            "Resource type {:?} cannot be scaled",
            resource_type
        )),
    }
}

// restart resource by name in a namespace
#[tauri::command]
pub async fn restart_resource(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: ResourceType,
    name: String,
) -> Result<(), String> {
    match resource_type {
        ResourceType::Deployment | ResourceType::StatefulSet | ResourceType::DaemonSet => {
            let cmd_string = format!(
                "--kubeconfig {} --context {} rollout restart {} {} -n {}",
                kubeconfig_path,
                context,
                resource_type.as_str(),
                name,
                namespace
            );
            run_kubectl_command(&cmd_string)?;
            Ok(())
        }
        _ => Err(format!(
            "Resource type {:?} cannot be restarted",
            resource_type
        )),
    }
}

// list events of a resource by name
#[tauri::command]
pub async fn list_resource_events(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: ResourceType,
    name: String,
) -> Result<Vec<Event>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    match resource_type {
        ResourceType::Pod => {
            let events = k8s_client::list_events::<Pod>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::Deployment => {
            let events = k8s_client::list_events::<Deployment>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::StatefulSet => {
            let events = k8s_client::list_events::<StatefulSet>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::DaemonSet => {
            let events = k8s_client::list_events::<DaemonSet>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::Job => {
            let events = k8s_client::list_events::<Job>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::CronJob => {
            let events = k8s_client::list_events::<CronJob>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::ConfigMap => {
            let events = k8s_client::list_events::<ConfigMap>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::Secret => {
            let events = k8s_client::list_events::<Secret>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::Service => {
            let events = k8s_client::list_events::<Service>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::ServiceAccount => {
            let events = k8s_client::list_events::<ServiceAccount>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::Role => {
            let events = k8s_client::list_events::<Role>(client, &namespace, &name).await?;
            Ok(events)
        }
        ResourceType::RoleBinding => {
            let events = k8s_client::list_events::<RoleBinding>(client, &namespace, &name).await?;
            Ok(events)
        }
        _ => Err(format!("Unsupported resource type: {:?}", resource_type)),
    }
}
