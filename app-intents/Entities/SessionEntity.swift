import AppIntents
internal import ExpoAppIntents
import Foundation

private func normalizeSessionText(_ value: String) -> String {
  return
    value
    .folding(options: [.caseInsensitive, .diacriticInsensitive], locale: .current)
    .trimmingCharacters(in: .whitespacesAndNewlines)
}

struct SessionEntity: AppEntity {
  static let typeDisplayRepresentation: TypeDisplayRepresentation = "Session"
  static let defaultQuery = SessionQuery()

  var id: String
  @Property(title: "Name")
  var name: String
  var subtitle: String?
  var synonyms: [String]

  var displayRepresentation: DisplayRepresentation {
    if let subtitle {
      if #available(iOS 17.0, *) {
        return DisplayRepresentation(
          title: "\(name)",
          subtitle: "\(subtitle)",
          synonyms: synonyms.map { LocalizedStringResource(stringLiteral: $0) }
        )
      }
      return DisplayRepresentation(title: "\(name)", subtitle: "\(subtitle)")
    }

    if #available(iOS 17.0, *) {
      return DisplayRepresentation(
        title: "\(name)",
        synonyms: synonyms.map { LocalizedStringResource(stringLiteral: $0) }
      )
    }
    return DisplayRepresentation(title: "\(name)")
  }

  init(record: AppIntentEntityRecord) {
    self.id = record.id
    self.subtitle = record.subtitle
    self.synonyms = record.synonyms
    self.name = record.title
  }

  private var searchableTerms: [String] {
    return [id, name] + synonyms
  }

  func matches(_ searchText: String) -> Bool {
    let normalizedSearch = normalizeSessionText(searchText)
    guard !normalizedSearch.isEmpty else {
      return false
    }

    return searchableTerms.map(normalizeSessionText).contains { term in
      normalizedSearch == term || normalizedSearch.contains(term) || term.contains(normalizedSearch)
    }
  }
}
