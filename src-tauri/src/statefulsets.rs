use crate::k8s_client;
use k8s_openapi::api::apps::v1::StatefulSet;

#[tauri::command]
pub async fn list_statefulsets(
    kubeconfig_path: String,
    context: String,
    namespace: String,
) -> Result<Vec<StatefulSet>, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::list_resources::<StatefulSet>(client, &namespace).await
}

// get a statefulset by name in a namespace
#[tauri::command]
pub async fn get_statefulset(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    name: String,
) -> Result<StatefulSet, String> {
    let client = k8s_client::create_k8s_client(kubeconfig_path, context).await?;
    k8s_client::get_resource::<StatefulSet>(client, &namespace, &name).await
}
