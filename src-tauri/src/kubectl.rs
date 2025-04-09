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
        // List of common terminal emulators in order of preference
        let terminals = [
            (
                "gnome-terminal",
                vec![
                    "--",
                    "bash",
                    "-c",
                    &format!("{}; echo 'Press Enter to continue...'; read", cmd_string),
                ],
            ),
            (
                "konsole",
                vec![
                    "--noclose",
                    "-e",
                    &format!(
                        "bash -c '{} && echo \"Press Enter to continue...\" && read'",
                        cmd_string
                    ),
                ],
            ),
            (
                "xfce4-terminal",
                vec!["--hold", "-e", &format!("{}", cmd_string)],
            ),
            (
                "xterm",
                vec![
                    "-e",
                    &format!("{}; read -p 'Press Enter to continue...'", cmd_string),
                ],
            ),
            (
                "terminator",
                vec![
                    "-e",
                    &format!("{}; read -p 'Press Enter to continue...'", cmd_string),
                ],
            ),
            (
                "alacritty",
                vec![
                    "-e",
                    "bash",
                    "-c",
                    &format!("{}; read -p 'Press Enter to continue...'", cmd_string),
                ],
            ),
        ];

        // Try each terminal in order
        for (terminal, args) in terminals.iter() {
            // Check if terminal exists by trying to get its path
            if Command::new("which")
                .arg(terminal)
                .output()
                .map(|output| output.status.success())
                .unwrap_or(false)
            {
                // Terminal found, try to launch it
                if let Ok(_) = Command::new(terminal).args(args).spawn() {
                    return Ok(());
                }
            }
        }

        // If we get here, none of the terminals worked
        return Err("No supported terminal emulator found".to_string());
    }
    Ok(())
}
