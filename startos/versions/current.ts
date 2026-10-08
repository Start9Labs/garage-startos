import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.4.1:1',
  releaseNotes: {
    en_US: `Updated Garage to 2.4.1. This patch fixes a startup panic affecting Consul and Kubernetes discovery. Full release notes: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1

- Delete Bucket explains that Garage deletes only empty buckets, and that every API key loses its access to a deleted bucket
- Delete Bucket, Delete API Key and Grant Bucket Access to Keys list the items Garage refused, with its error, in a copyable field
- Grant Bucket Access to Keys asks you to pick the bucket, explains what each permission allows, and says that a permission turned off is removed from the key
- Grant Bucket Access to Keys is listed with the other API key actions
- The health check names Garage in every language`,
    es_ES: `Garage se actualizó a la versión 2.4.1. Este parche corrige un fallo al iniciar con el descubrimiento de Consul o Kubernetes. Notas completas de la versión: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1

- Eliminar bucket explica que Garage solo elimina buckets vacíos y que todas las claves API pierden su acceso a un bucket eliminado
- Eliminar bucket, Eliminar clave API y Conceder acceso de bucket a claves muestran los elementos que Garage rechazó, con su error, en un campo copiable
- Conceder acceso de bucket a claves le pide elegir el bucket, explica qué permite cada permiso e indica que un permiso desactivado se retira de la clave
- Conceder acceso de bucket a claves aparece junto a las demás acciones de claves API
- La comprobación de estado nombra a Garage en todos los idiomas`,
    de_DE: `Garage wurde auf Version 2.4.1 aktualisiert. Dieser Patch behebt einen Absturz beim Start mit Consul- oder Kubernetes-Discovery. Vollständige Versionshinweise: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1

- Bucket löschen erklärt, dass Garage nur leere Buckets löscht und dass jeder API-Schlüssel seinen Zugriff auf einen gelöschten Bucket verliert
- Bucket löschen, API-Schlüssel löschen und Bucket-Zugriff für Schlüssel gewähren zeigen die von Garage abgelehnten Einträge mit ihrem Fehler in einem kopierbaren Feld an
- Bucket-Zugriff für Schlüssel gewähren fordert Sie auf, den Bucket auszuwählen, erklärt, was jede Berechtigung erlaubt, und weist darauf hin, dass eine deaktivierte Berechtigung dem Schlüssel entzogen wird
- Bucket-Zugriff für Schlüssel gewähren steht bei den anderen API-Schlüssel-Aktionen
- Die Zustandsprüfung nennt Garage in jeder Sprache`,
    pl_PL: `Zaktualizowano Garage do wersji 2.4.1. Ta poprawka usuwa awarię podczas uruchamiania z wykrywaniem Consul lub Kubernetes. Pełne informacje o wydaniu: https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1

- Usuń bucket wyjaśnia, że Garage usuwa tylko puste buckety i że każdy klucz API traci dostęp do usuniętego bucketa
- Usuń bucket, Usuń klucz API i Przyznaj dostęp bucketa do kluczy pokazują elementy odrzucone przez Garage wraz z błędem w polu do skopiowania
- Przyznaj dostęp bucketa do kluczy prosi o wybranie bucketa, wyjaśnia, na co pozwala każde uprawnienie, i informuje, że wyłączone uprawnienie zostaje kluczowi odebrane
- Przyznaj dostęp bucketa do kluczy znajduje się obok pozostałych akcji kluczy API
- Kontrola stanu nazywa Garage w każdym języku`,
    fr_FR: `Garage a été mis à jour vers la version 2.4.1. Ce correctif résout un plantage au démarrage avec la découverte Consul ou Kubernetes. Notes de version complètes : https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.4.1

- Supprimer un bucket explique que Garage ne supprime que les buckets vides et que chaque clé API perd son accès à un bucket supprimé
- Supprimer un bucket, Supprimer une clé API et Accorder l'accès d'un bucket à des clés affichent les éléments refusés par Garage, avec son erreur, dans un champ copiable
- Accorder l'accès d'un bucket à des clés vous demande de choisir le bucket, explique ce que permet chaque permission et indique qu'une permission désactivée est retirée de la clé
- Accorder l'accès d'un bucket à des clés figure avec les autres actions de clés API
- La vérification de santé nomme Garage dans toutes les langues`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
