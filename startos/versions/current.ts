import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.4.1:0',
  releaseNotes: {
    en_US:
      'Updated Garage to 2.4.1. This patch fixes a startup panic affecting Consul and Kubernetes discovery. Full release notes: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1',
    es_ES:
      'Garage se actualizó a la versión 2.4.1. Este parche corrige un fallo al iniciar con el descubrimiento de Consul o Kubernetes. Notas completas de la versión: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1',
    de_DE:
      'Garage wurde auf Version 2.4.1 aktualisiert. Dieser Patch behebt einen Absturz beim Start mit Consul- oder Kubernetes-Discovery. Vollständige Versionshinweise: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1',
    pl_PL:
      'Zaktualizowano Garage do wersji 2.4.1. Ta poprawka usuwa awarię podczas uruchamiania z wykrywaniem Consul lub Kubernetes. Pełne informacje o wydaniu: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1',
    fr_FR:
      'Garage a été mis à jour vers la version 2.4.1. Ce correctif résout un plantage au démarrage avec la découverte Consul ou Kubernetes. Notes de version complètes : https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
