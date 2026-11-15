internal import ExpoModulesCore
import HealthKit

/// Saves workouts to Apple Health, and runs a live workout session during a timed session so the
/// timer and voice cues keep going while the phone is locked. The app only writes workouts. It
/// never reads anything from Health.
final class WorkoutHealth: Module {
  private let store = HKHealthStore()
  /// The live session and its builder. Typed loosely because they only exist on iOS 26 and later.
  private var session: AnyObject?
  private var builder: AnyObject?

  public func definition() -> ExpoModulesCore.ModuleDefinition {
    Name("WorkoutHealth")

    Function("isAvailable") { () -> Bool in
      HKHealthStore.isHealthDataAvailable()
    }

    /// Workout sessions on iPhone arrived in iOS 26. Older phones can still save finished workouts.
    Function("supportsLiveWorkouts") { () -> Bool in
      if #available(iOS 26.0, *) { return true }
      return false
    }

    Function("isAuthorized") { () -> Bool in
      self.authorized
    }

    /// Shows the Health permission sheet the first time. Returns true when saving workouts is allowed.
    AsyncFunction("requestAccess") { () async throws -> Bool in
      guard HKHealthStore.isHealthDataAvailable() else { return false }
      try await self.store.requestAuthorization(toShare: [HKObjectType.workoutType()], read: [])
      return self.authorized
    }

    /// Starts a live workout session. While it runs, iOS keeps the app going on the Lock Screen.
    AsyncFunction("startLiveWorkout") { (activity: String, startMs: Double) async throws -> Bool in
      guard #available(iOS 26.0, *), self.authorized else { return false }
      self.discardLiveWorkout()
      let configuration = Self.configuration(for: activity)
      let session = try HKWorkoutSession(healthStore: self.store, configuration: configuration)
      let builder = session.associatedWorkoutBuilder()
      let start = Date(timeIntervalSince1970: startMs / 1000)
      session.startActivity(with: start)
      try await builder.beginCollection(at: start)
      self.session = session
      self.builder = builder
      return true
    }

    /// Pausing the session also pauses the workout's duration in Health.
    Function("pauseLiveWorkout") {
      if #available(iOS 26.0, *) { (self.session as? HKWorkoutSession)?.pause() }
    }

    Function("resumeLiveWorkout") {
      if #available(iOS 26.0, *) { (self.session as? HKWorkoutSession)?.resume() }
    }

    /// Ends the live session. With `save`, the workout goes into Health. Without it, it is dropped.
    AsyncFunction("endLiveWorkout") { (endMs: Double, save: Bool) async throws -> Bool in
      guard #available(iOS 26.0, *),
        let session = self.session as? HKWorkoutSession,
        let builder = self.builder as? HKLiveWorkoutBuilder
      else { return false }
      self.session = nil
      self.builder = nil
      let end = Date(timeIntervalSince1970: endMs / 1000)
      session.end()
      guard save else {
        builder.discardWorkout()
        return false
      }
      try await builder.endCollection(at: end)
      _ = try await builder.finishWorkout()
      return true
    }

    /// Saves a finished workout, such as a strength checklist, given its start and end in milliseconds.
    AsyncFunction("saveWorkout") { (activity: String, startMs: Double, endMs: Double) async throws -> Bool in
      guard self.authorized, endMs > startMs else { return false }
      let builder = HKWorkoutBuilder(
        healthStore: self.store, configuration: Self.configuration(for: activity), device: .local())
      try await builder.beginCollection(at: Date(timeIntervalSince1970: startMs / 1000))
      try await builder.endCollection(at: Date(timeIntervalSince1970: endMs / 1000))
      _ = try await builder.finishWorkout()
      return true
    }

    OnDestroy {
      self.discardLiveWorkout()
    }
  }

  private var authorized: Bool {
    HKHealthStore.isHealthDataAvailable()
      && store.authorizationStatus(for: HKObjectType.workoutType()) == .sharingAuthorized
  }

  private func discardLiveWorkout() {
    if #available(iOS 26.0, *) {
      (builder as? HKLiveWorkoutBuilder)?.discardWorkout()
      (session as? HKWorkoutSession)?.end()
    }
    session = nil
    builder = nil
  }

  /// Maps the app's session types to Health's workout types. Everything is indoors.
  private static func configuration(for activity: String) -> HKWorkoutConfiguration {
    let configuration = HKWorkoutConfiguration()
    configuration.locationType = .indoor
    switch activity {
    case "rowing": configuration.activityType = .rowing
    case "running": configuration.activityType = .running
    case "cycling": configuration.activityType = .cycling
    case "boxing": configuration.activityType = .boxing
    case "jumpRope": configuration.activityType = .jumpRope
    case "hiit": configuration.activityType = .highIntensityIntervalTraining
    case "functionalStrength": configuration.activityType = .functionalStrengthTraining
    case "traditionalStrength": configuration.activityType = .traditionalStrengthTraining
    case "crossTraining": configuration.activityType = .crossTraining
    case "flexibility": configuration.activityType = .flexibility
    default: configuration.activityType = .mixedCardio
    }
    return configuration
  }
}
