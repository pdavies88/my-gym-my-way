import AppIntents
internal import ExpoAppIntents

/// Opens My Gym My Way and starts the next workout in the person's program.
struct StartNextWorkoutIntent: AppIntent {
  static let title: LocalizedStringResource = "Start Next Workout"
  static let description = IntentDescription("Starts the next workout in your 4-week program.")
  static let openAppWhenRun: Bool = true

  @MainActor
  func perform() async throws -> some IntentResult {
    await AppIntentDispatcher.shared.dispatch(name: "startNextWorkout", params: [:])
    return .result()
  }
}

/// Opens My Gym My Way and starts a guided session, such as Quiet morning or 5-minute stretch.
struct StartSessionIntent: AppIntent {
  static let title: LocalizedStringResource = "Start Session"
  static let description = IntentDescription("Starts a guided cardio, quiet, mobility or stretch session.")
  static let openAppWhenRun: Bool = true

  @Parameter(title: "Session", requestValueDialog: "Which session would you like?")
  var session: SessionEntity

  static var parameterSummary: some ParameterSummary {
    Summary("Start \(\.$session)")
  }

  @MainActor
  func perform() async throws -> some IntentResult {
    await AppIntentDispatcher.shared.dispatch(name: "startSession", params: ["sessionId": .string(session.id)])
    return .result()
  }
}
