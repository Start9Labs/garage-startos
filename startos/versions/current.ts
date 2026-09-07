import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.4.0:0',
  releaseNotes: {
    en_US:
      'Updated Garage to 2.4.0. Improves S3 compatibility and CORS handling, fixes crashes when object versions have missing blocks, and fixes reflected XSS in website error responses. Full release notes: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.0',
    es_ES:
      'Garage se actualizó a la versión 2.4.0. Mejora la compatibilidad con S3 y la gestión de CORS, corrige fallos cuando las versiones de objetos tienen bloques ausentes y corrige un XSS reflejado en las respuestas de error del sitio web. Notas completas de la versión: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.0',
    de_DE:
      'Garage wurde auf Version 2.4.0 aktualisiert. Die S3-Kompatibilität und CORS-Verarbeitung wurden verbessert, Abstürze bei Objektversionen mit fehlenden Blöcken behoben und eine reflektierte XSS-Schwachstelle in Website-Fehlerantworten geschlossen. Vollständige Versionshinweise: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.0',
    pl_PL:
      'Zaktualizowano Garage do wersji 2.4.0. Ulepszono zgodność z S3 i obsługę CORS, naprawiono awarie w przypadku wersji obiektów z brakującymi blokami oraz usunięto podatność na atak reflected XSS w odpowiedziach błędów witryny. Pełne informacje o wydaniu: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.0',
    fr_FR:
      'Garage a été mis à jour vers la version 2.4.0. Cette version améliore la compatibilité S3 et la gestion de CORS, corrige des plantages lorsque des versions d’objets ont des blocs manquants et corrige une faille XSS réfléchie dans les réponses d’erreur du site web. Notes de version complètes : https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
