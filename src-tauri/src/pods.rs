use crate::k8s_client;
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
