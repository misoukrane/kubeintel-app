use crate::k8s_client;
use k8s_openapi::api::core::v1::Pod;
use std::process::Command;

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
        "kubectl --kubeconfig {} --context {} exec -it {} -n {} --container {} -- {}",
        kubeconfig_path, context, pod_name, namespace, container_name, cmd_shell
    );
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "cmd", "/K", &cmd_string])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("osascript")
            .args([
                "-e",
                &format!(
                    "tell application \"Terminal\" to do script \"{}\"",
                    cmd_string
                ),
                "-e",
                "tell application \"Terminal\" to activate",
            ])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xterm")
            .args([
                "-e",
                &format!("{}; read -p 'Press Enter to continue...'", cmd_string),
            ])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}
