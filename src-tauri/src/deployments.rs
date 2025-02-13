use crate::kubectl::run_kubectl_command;

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
