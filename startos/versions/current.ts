import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.4.1:3',
  releaseNotes: {
    en_US: 'Updated the StartOS SDK to 3.0.6. No change in behavior.',
    es_ES:
      'Actualizado el SDK de StartOS a 3.0.6. Sin cambios de comportamiento.',
    de_DE: 'StartOS-SDK auf 3.0.6 aktualisiert. Keine Verhaltensänderung.',
    pl_PL: 'Zaktualizowano SDK StartOS do 3.0.6. Bez zmian w działaniu.',
    fr_FR:
      'Mise à jour du SDK StartOS vers 3.0.6. Aucun changement de comportement.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
