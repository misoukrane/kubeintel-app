use std::process::Command;

pub fn run_kubectl_command(command: &str) -> Result<(), String> {
    let cmd_string = format!("kubectl {}", command);
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args([
                "/C",
                "start",
                "cmd",
                "/K",
                &format!("echo {} && {}", cmd_string, cmd_string),
            ])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("osascript")
            .args([
                "-e",
                &format!(
                    r#"
                tell application "Terminal"
                do script "{}"
                activate
                set bounds of front window to {{100, 100, 800, 600}}
                end tell
            "#,
                    cmd_string
                ),
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
