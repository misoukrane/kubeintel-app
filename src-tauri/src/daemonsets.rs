use crate::k8s_client;
use k8s_openapi::api::apps::v1::DaemonSet;

// list all daemonsets in a namespace
#[tauri::command]
pub async fn list_daemonsets(
    kubeconfig_path: String,
    context: String,
    namespace: String,
) -> Result<Vec<DaemonSet>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::list_resources::<DaemonSet>(client, &namespace).await
}
