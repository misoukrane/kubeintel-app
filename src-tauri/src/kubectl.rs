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
        return Ok(());
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
        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        // List of common terminal emulators in order of preference
        let gnome_command = format!(
            "bash -c 'echo \"{}\" && {} && read -p \"Press Enter to exit...\"'",
            cmd_string, cmd_string
        );
        let konsole_command = format!(
            "bash -c 'echo \"{}\" && {} && read -p \"Press Enter to exit...\"'",
            cmd_string, cmd_string
        );
        let xfce_command = format!(
            "bash -c 'echo \"{}\" && {} && read -p \"Press Enter to exit...\"'",
            cmd_string, cmd_string
        );
        let xterm_command = format!(
            "bash -c 'echo \"{}\" && {} && read -p \"Press Enter to exit...\"'",
            cmd_string, cmd_string
        );
        let terminator_command = format!(
            "bash -c 'echo \"{}\" && {} && read -p \"Press Enter to exit...\"'",
            cmd_string, cmd_string
        );
        let alacritty_command = format!(
            "bash -c 'echo \"{}\" && {} && read -p \"Press Enter to exit...\"'",
            cmd_string, cmd_string
        );

        let terminals = [
            ("gnome-terminal", vec!["--", "bash", "-c", &gnome_command]),
            ("konsole", vec!["--noclose", "-e", &konsole_command]),
            ("xfce4-terminal", vec!["--hold", "-e", &xfce_command]),
            ("xterm", vec!["-e", &xterm_command]),
            ("terminator", vec!["-e", &terminator_command]),
            ("alacritty", vec!["-e", "bash", "-c", &alacritty_command]),
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
}
