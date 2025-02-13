use crate::kubectl::run_kubectl_command;

// debug a pod by name in a namespace
#[tauri::command]
pub async fn debug_pod(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    pod_name: String,
    image: String,
    target: Option<String>,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} debug {} -it -n {} --image {}",
        kubeconfig_path, context, pod_name, namespace, image,
    );
    // if target is Some, add it to the command
    // otherwise ignore
    let cmd_string = match target {
        None => cmd_string,
        Some(ref t) if t.is_empty() => cmd_string,
        Some(t) => format!("{} --target {}", cmd_string, t),
    };

    run_kubectl_command(&cmd_string)?;
    Ok(())
}

#[tauri::command]
pub fn open_pod_shell(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    pod_name: String,
    container_name: String,
    cmd_shell: String,
) -> Result<(), String> {
    let cmd_string = format!(
        "--kubeconfig {} --context {} exec -it {} -n {} --container {} -- {}",
        kubeconfig_path, context, pod_name, namespace, container_name, cmd_shell
    );
    run_kubectl_command(&cmd_string)?;
    Ok(())
}
