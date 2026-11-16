import AppIntents
internal import ExpoAppIntents

/// Finds SessionEntity values in the catalog the app publishes from JavaScript: every guided
/// cardio, quiet, mobility and stretch session.
struct SessionQuery: EntityStringQuery {
  func entities(for identifiers: [String]) async throws -> [SessionEntity] {
    return try await AppIntentEntityStore.shared.entities(ofKind: "session", matching: identifiers)
      .map(SessionEntity.init(record:))
  }

  func suggestedEntities() async throws -> [SessionEntity] {
    return try await AppIntentEntityStore.shared.entities(ofKind: "session")
      .map(SessionEntity.init(record:))
  }

  func entities(matching string: String) async throws -> [SessionEntity] {
    return try await suggestedEntities().filter { $0.matches(string) }
  }
}
