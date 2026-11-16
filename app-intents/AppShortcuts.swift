import AppIntents

/// Siri phrases for My Gym My Way. Every phrase must include \(.applicationName).
struct AppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: StartNextWorkoutIntent(),
      phrases: [
        "Start my next workout in \(.applicationName)",
        "Start my workout in \(.applicationName)",
        "Next workout in \(.applicationName)",
      ],
      shortTitle: "Next Workout",
      systemImageName: "dumbbell.fill"
    )
    AppShortcut(
      intent: StartSessionIntent(),
      phrases: [
        "Start \(\.$session) in \(.applicationName)",
        "Start a session in \(.applicationName)",
        "Do \(\.$session) with \(.applicationName)",
      ],
      shortTitle: "Start Session",
      systemImageName: "figure.run"
    )
  }
}
