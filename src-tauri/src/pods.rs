use crate::k8s_client;
use crate::kubectl::run_kubectl_command;
use k8s_openapi::api::core::v1::Pod;

// list all pods in a namespace
#[tauri::command]
pub async fn list_pods(
    kubeconfig_path: String,
    context: String,
    namespace: String,
) -> Result<Vec<Pod>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::list_resources::<Pod>(client, &namespace).await
}

// get a pod by name in a namespace
#[tauri::command]
pub async fn get_pod(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
) -> Result<Pod, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::get_resource::<Pod>(client, &namespace, &name).await
}

// delete a pod by name in a namespace
#[tauri::command]
pub async fn delete_pod(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
) -> Result<(), String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::delete_resource::<Pod>(client, &namespace, &name).await
}

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
