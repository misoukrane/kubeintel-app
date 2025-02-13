use crate::k8s_client;
use crate::kubectl::run_kubectl_command;
use k8s_openapi::api::apps::v1::{DaemonSet, Deployment, StatefulSet};
use k8s_openapi::api::core::v1::Pod;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "kind")]
pub enum KubeResource {
    Pod(Pod),
    Deployment(Deployment),
    StatefulSet(StatefulSet),
    DaemonSet(DaemonSet),
}

// delete a resource by name in a namespace
#[tauri::command]
pub async fn delete_resource(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: String,
    name: String,
) -> Result<(), String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    match resource_type.as_str() {
        "pod" => k8s_client::delete_resource::<Pod>(client, &namespace, &name).await,
        "deployment" => k8s_client::delete_resource::<Deployment>(client, &namespace, &name).await,
        "statefulset" => {
            k8s_client::delete_resource::<StatefulSet>(client, &namespace, &name).await
        }
        "daemonset" => k8s_client::delete_resource::<DaemonSet>(client, &namespace, &name).await,
        _ => Err(format!("Unsupported resource type: {}", resource_type)),
    }
}

// get resource events in terminal
#[tauri::command]
pub async fn open_resource_events_in_terminal(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: String,
    name: String,
) -> Result<(), String> {
    // capitalize the first letter of the resource
    let resource = resource_type
        .chars()
        .next()
        .unwrap()
        .to_uppercase()
        .to_string()
        + &resource_type[1..];
    let cmd_string = format!(
        "--kubeconfig {} --context {} get events -n {} --field-selector involvedObject.name={},involvedObject.kind={}",
        kubeconfig_path, context, namespace, name, resource
    );
    run_kubectl_command(&cmd_string)?;
    Ok(())
}

#[tauri::command]
pub async fn open_resource_logs_in_terminal(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: String,
    name: String,
    container_name: Option<String>,
) -> Result<(), String> {
    // Base command with common parameters
    let mut cmd_string = format!(
        "--kubeconfig {} --context {} logs -n {}",
        kubeconfig_path, context, namespace,
    );

    // Add resource-specific flags
    match resource_type.as_str() {
        "deployment" => {
            cmd_string = format!("{} -f deployment/{} --all-pods", cmd_string, name);
        }
        "statefulset" => {
            cmd_string = format!("{} -f statefulset/{} --all-pods", cmd_string, name);
        }
        "daemonset" => {
            cmd_string = format!("{} -f daemonset/{} --all-pods", cmd_string, name);
        }
        "pod" => {
            cmd_string = format!("{} {}", cmd_string, name);
        }
        _ => return Err(format!("Unsupported resource type: {}", resource_type)),
    }

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
    resource_type: String,
    name: String,
) -> Result<KubeResource, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    match resource_type.as_str() {
        "pod" => {
            let resource = k8s_client::get_resource::<Pod>(client, &namespace, &name).await?;
            Ok(KubeResource::Pod(resource))
        }
        "deployment" => {
            let resource =
                k8s_client::get_resource::<Deployment>(client, &namespace, &name).await?;
            Ok(KubeResource::Deployment(resource))
        }
        "statefulset" => {
            let resource =
                k8s_client::get_resource::<StatefulSet>(client, &namespace, &name).await?;
            Ok(KubeResource::StatefulSet(resource))
        }
        "daemonset" => {
            let resource = k8s_client::get_resource::<DaemonSet>(client, &namespace, &name).await?;
            Ok(KubeResource::DaemonSet(resource))
        }
        _ => Err(format!("Unsupported resource type: {}", resource_type)),
    }
}

// list a resource by name in a namespace
#[tauri::command]
pub async fn list_resource(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: String,
) -> Result<Vec<KubeResource>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;

    match resource_type.as_str() {
        "pod" => {
            let resources = k8s_client::list_resources::<Pod>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::Pod).collect())
        }
        "deployment" => {
            let resources = k8s_client::list_resources::<Deployment>(client, &namespace).await?;
            Ok(resources
                .into_iter()
                .map(KubeResource::Deployment)
                .collect())
        }
        "statefulset" => {
            let resources = k8s_client::list_resources::<StatefulSet>(client, &namespace).await?;
            Ok(resources
                .into_iter()
                .map(KubeResource::StatefulSet)
                .collect())
        }
        "daemonset" => {
            let resources = k8s_client::list_resources::<DaemonSet>(client, &namespace).await?;
            Ok(resources.into_iter().map(KubeResource::DaemonSet).collect())
        }
        _ => Err(format!("Unsupported resource type: {}", resource_type)),
    }
}

// scale a resource by name in a namespace
// this will only be allowed for resources that support scaling
#[tauri::command]
pub async fn scale_resource(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource_type: String,
    name: String,
    current_replicas: i32,
    replicas: i32,
) -> Result<(), String> {
    // resources that can be scaled
    let resources = ["deployment", "replicaset", "statefulset"];
    if !resources.contains(&resource_type.as_str()) {
        return Err(format!("Resource type {} cannot be scaled", resource_type));
    }
    let cmd_string = format!(
        "--kubeconfig {} --context {} scale {} {} -n {} --current-replicas={} --replicas={}",
        kubeconfig_path, context, resource_type, name, namespace, current_replicas, replicas,
    );
    run_kubectl_command(&cmd_string)?;
    Ok(())
}
