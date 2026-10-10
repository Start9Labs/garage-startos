import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.4.1:2',
  releaseNotes: {
    en_US: `Action forms, results, errors and cluster status labels now use your selected language instead of English.

- API key creation reports unreadable credentials instead of displaying unusable placeholders, with instructions to delete the key and create another.
- Internal update to start-sdk 3.0.4.`,
    es_ES: `Los formularios, resultados y errores de las acciones y las etiquetas del estado del clúster ahora usan el idioma seleccionado en lugar del inglés.

- La creación de claves API informa cuando no se pueden leer las credenciales, en lugar de mostrar valores de ejemplo inutilizables, e indica que elimine la clave y cree otra.
- Actualización interna a start-sdk 3.0.4.`,
    de_DE: `Aktionsformulare, Ergebnisse, Fehler und Cluster-Statusbezeichnungen verwenden jetzt die gewählte Sprache statt Englisch.

- Die Erstellung von API-Schlüsseln meldet nicht lesbare Zugangsdaten statt unbrauchbarer Platzhalter und weist darauf hin, den Schlüssel zu löschen und einen neuen zu erstellen.
- Interne Aktualisierung auf start-sdk 3.0.4.`,
    pl_PL: `Formularze, wyniki i błędy akcji oraz etykiety statusu klastra używają teraz wybranego języka zamiast angielskiego.

- Tworzenie kluczy API informuje o nieczytelnych danych uwierzytelniających zamiast wyświetlać bezużyteczne wartości zastępcze i zaleca usunięcie klucza oraz utworzenie nowego.
- Wewnętrzna aktualizacja do start-sdk 3.0.4.`,
    fr_FR: `Les formulaires, résultats et erreurs des actions ainsi que les libellés d’état du cluster utilisent désormais la langue sélectionnée au lieu de l’anglais.

- La création de clés API signale les identifiants illisibles au lieu d’afficher des valeurs de substitution inutilisables et indique de supprimer la clé puis d’en créer une autre.
- Mise à jour interne vers start-sdk 3.0.4.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
