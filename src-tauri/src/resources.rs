use crate::k8s_client;
use crate::kubectl::run_kubectl_command;
use k8s_openapi::api::apps::v1::{DaemonSet, Deployment, StatefulSet};
use k8s_openapi::api::core::v1::{Node, Pod};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "kind")]
pub enum KubeResource {
    Pod(Pod),
    Deployment(Deployment),
    StatefulSet(StatefulSet),
    DaemonSet(DaemonSet),
    Node(Node),
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
        _ => Err(format!("Unsupported resource type: {:?}", resource_type)),
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
    let cmd_string = format!(
        "--kubeconfig {} --context {} get events -n {} --field-selector involvedObject.name={},involvedObject.kind={}",
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
        ResourceType::Node => {
            // For nodes, we use get_cluster_resource since they are cluster-scoped
            let resource = k8s_client::get_cluster_resource::<Node>(client, &name).await?;
            Ok(KubeResource::Node(resource))
        }
        _ => Err(format!("Unsupported resource type: {:?}", resource_type)),
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
            Ok(resources
                .into_iter()
                .map(KubeResource::Deployment)
                .collect())
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
        ResourceType::Node => {
            // For nodes, we ignore the namespace parameter since they are cluster-scoped
            let resources = k8s_client::list_cluster_resources::<Node>(client).await?;
            Ok(resources.into_iter().map(KubeResource::Node).collect())
        }
        _ => Err(format!("Unsupported resource type: {:?}", resource_type)),
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
