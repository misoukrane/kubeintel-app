use crate::k8s_client;
use crate::kubectl::run_kubectl_command;
use k8s_openapi::api::core::v1::Pod;
use kube::api::{Api, LogParams};

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

#[tauri::command]
pub async fn get_pod_logs(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    pod_name: String,
    container_name: String,
    tail_lines: Option<i64>,
    limit_bytes: Option<i64>,
) -> Result<String, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    let pods: Api<Pod> = Api::namespaced(client, &namespace);

    let log_params = LogParams {
        container: Some(container_name),
        follow: false,
        tail_lines: tail_lines.or(Some(50)), // Default to last 50 lines
        limit_bytes: limit_bytes.or(Some(1024 * 100)), // Default to 100kb (1024 * 100 bytes)
        ..LogParams::default()
    };

    let logs = pods
        .logs(&pod_name, &log_params)
        .await
        .map_err(|e| e.to_string())?;
    Ok(logs)
}
