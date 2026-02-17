use tauri_plugin_log::{Target, TargetKind, RotationStrategy};

pub mod financial;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .rotation_strategy(RotationStrategy::KeepSome(15))
                .max_file_size(10 * 1024 * 1024)
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:gusto.db", vec![
                    tauri_plugin_sql::Migration {
                        version: 1,
                        description: "create_labor_rates",
                        sql: include_str!("../migrations/1_create_labor_rates.sql"),
                        kind: tauri_plugin_sql::MigrationKind::Up,
                    },
                    tauri_plugin_sql::Migration {
                        version: 2,
                        description: "create_finance_tables",
                        sql: include_str!("../migrations/2_create_finance_tables.sql"),
                        kind: tauri_plugin_sql::MigrationKind::Up,
                    },
                    tauri_plugin_sql::Migration {
                        version: 3,
                        description: "persist_recipe_financials",
                        sql: include_str!("../migrations/3_persist_recipe_financials.sql"),
                        kind: tauri_plugin_sql::MigrationKind::Up,
                    },
                    tauri_plugin_sql::Migration {
                        version: 4,
                        description: "link_income_to_recipes",
                        sql: include_str!("../migrations/4_link_income_to_recipes.sql"),
                        kind: tauri_plugin_sql::MigrationKind::Up,
                    }
                ])
                .build()
        )
        .invoke_handler(tauri::generate_handler![
            financial::calculate_recipe_cost,
            financial::calculate_standard_cost
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
