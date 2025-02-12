use crate::k8s_client;
use crate::kubectl::run_kubectl_command;
use k8s_openapi::api::apps::v1::Deployment;

// list all deployments in a namespace
#[tauri::command]
pub async fn list_deployments(
    kubeconfig_path: String,
    context: String,
    namespace: String,
) -> Result<Vec<Deployment>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::list_resources::<Deployment>(client, &namespace).await
}

// get a deployment by name in a namespace
#[tauri::command]
pub async fn get_deployment(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
) -> Result<Deployment, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::get_resource::<Deployment>(client, &namespace, &name).await
}

// delete a deployment by name in a namespace
#[tauri::command]
pub async fn delete_deployment(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
) -> Result<(), String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::delete_resource::<Deployment>(client, &namespace, &name).await
}

// scale a deployment by name in a namespace
#[tauri::command]
pub async fn scale_deployment(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
    current_replicas: i32,
    replicas: i32,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} scale deployment {} -n {} --current-replicas={} --replicas={}",
        kubeconfig_path, context, name, namespace, current_replicas, replicas,
    );
    run_kubectl_command(&cmd_string)?;
    Ok(())
}

// restart a deployment by name in a namespace
#[tauri::command]
pub async fn restart_deployment(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} rollout restart deployment {} -n {}",
        kubeconfig_path, context, name, namespace,
    );
    run_kubectl_command(&cmd_string)?;
    Ok(())
}

// Show logs of a deployment by name in a namespace
#[tauri::command]
pub async fn open_deployment_logs(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
    container_name: Option<String>,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} logs -f deployment/{} -n {} --all-pods",
        kubeconfig_path, context, name, namespace,
    );
    let cmd_string = match container_name {
        None => format!("{} --all-containers", cmd_string),
        Some(ref c) if c.is_empty() => format!("{} --all-containers", cmd_string),
        Some(c) => format!("{} -c {}", cmd_string, c),
    };
    run_kubectl_command(&cmd_string)?;
    Ok(())
}

// get deployment events
#[tauri::command]
pub async fn open_deployment_events(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} get events -n {} --field-selector involvedObject.name={},involvedObject.kind={}",
        kubeconfig_path, context, namespace, name , "Deployment"
    );
    run_kubectl_command(&cmd_string)?;
    Ok(())
}
