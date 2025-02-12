use crate::kubectl::run_kubectl_command;

// get resource events in terminal
#[tauri::command]
pub async fn open_resource_events_in_terminal(
    kubeconfig_path: String,
    context: String,
    namespace: String,
    resource: String,
    name: String,
) -> Result<(), String> {
    // capitalize the first letter of the resource
    let resource = resource.chars().next().unwrap().to_uppercase().to_string() + &resource[1..];
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
    resource: String,
    name: String,
    container_name: Option<String>,
) -> Result<(), String> {
    // Base command with common parameters
    let mut cmd_string = format!(
        "--kubeconfig {} --context {} logs -n {}",
        kubeconfig_path, context, namespace,
    );

    // Add resource-specific flags
    match resource.as_str() {
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
        _ => return Err(format!("Unsupported resource type: {}", resource)),
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
