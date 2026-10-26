import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.5.0:0',
  releaseNotes: {
    en_US: `Updated Garage to 2.5.0 and the StartOS SDK to 3.1.0. Fixes crashes from malformed URLs and admin tokens, improves S3 checksum compatibility, and adds resync queue size to Cluster Status.

Before updating, take a backup. Garage automatically migrates its resync queue on startup; startup time and metadata space usage may increase with the queue size. Do not downgrade after updating. Keys that read or change bucket lifecycle rules now need Owner permission; use Grant Bucket Access to Keys to grant it while retaining any required Read/Write permissions.

[Full upstream release notes](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.5.0)`,
    es_ES: `Actualizados Garage a 2.5.0 y el SDK de StartOS a 3.1.0. Corrige fallos por URL malformadas y tokens de administrador, mejora la compatibilidad de sumas de comprobación S3 y añade el tamaño de la cola de resincronización al estado del clúster.

Antes de actualizar, haga una copia de seguridad. Garage migra automáticamente su cola de resincronización al arrancar; el tiempo de arranque y el uso de espacio de metadatos pueden aumentar con el tamaño de la cola. No vuelva a una versión anterior después de actualizar. Las claves que leen o cambian reglas de ciclo de vida de buckets ahora necesitan el permiso Propietario; concédalo mediante Conceder acceso de bucket a claves, conservando los permisos Lectura/Escritura necesarios.

[Notas completas de la versión original](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.5.0)`,
    de_DE: `Garage auf 2.5.0 und das StartOS-SDK auf 3.1.0 aktualisiert. Behebt Abstürze durch fehlerhafte URLs und Admin-Token, verbessert die S3-Prüfsummenkompatibilität und zeigt die Größe der Resync-Warteschlange im Clusterstatus.

Vor dem Update eine Sicherung erstellen. Garage migriert seine Resync-Warteschlange beim Start automatisch; Startzeit und Metadaten-Speicherbedarf können mit der Warteschlangengröße steigen. Nach dem Update kein Downgrade durchführen. Schlüssel zum Lesen oder Ändern von Bucket-Lebenszyklusregeln benötigen jetzt Eigentümer-Rechte; diese über „Bucket-Zugriff für Schlüssel gewähren“ erteilen und benötigte Lesen/Schreiben-Rechte beibehalten.

[Vollständige Upstream-Versionshinweise](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.5.0)`,
    pl_PL: `Zaktualizowano Garage do 2.5.0 i SDK StartOS do 3.1.0. Naprawiono awarie spowodowane nieprawidłowymi adresami URL i tokenami administratora, poprawiono zgodność sum kontrolnych S3 i dodano rozmiar kolejki resynchronizacji do stanu klastra.

Przed aktualizacją wykonaj kopię zapasową. Garage automatycznie migruje kolejkę resynchronizacji przy uruchomieniu; czas uruchamiania i zużycie miejsca na metadane mogą wzrosnąć wraz z rozmiarem kolejki. Po aktualizacji nie wracaj do starszej wersji. Klucze odczytujące lub zmieniające reguły cyklu życia bucketów wymagają teraz uprawnienia Właściciel; nadaj je przez „Przyznaj dostęp bucketa do kluczy”, zachowując wymagane uprawnienia Odczyt/Zapis.

[Pełne informacje o wydaniu upstream](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.5.0)`,
    fr_FR: `Garage mis à jour vers 2.5.0 et le SDK StartOS vers 3.1.0. Corrige des plantages liés aux URL malformées et aux jetons administrateur, améliore la compatibilité des sommes de contrôle S3 et ajoute la taille de la file de resynchronisation à l’état du cluster.

Avant la mise à jour, effectuez une sauvegarde. Garage migre automatiquement sa file de resynchronisation au démarrage ; le temps de démarrage et l’espace occupé par les métadonnées peuvent augmenter avec la taille de la file. Ne revenez pas à une version antérieure après la mise à jour. Les clés qui lisent ou modifient les règles de cycle de vie des buckets nécessitent désormais la permission Propriétaire ; accordez-la via « Accorder l’accès d’un bucket à des clés » en conservant les permissions Lecture/Écriture nécessaires.

[Notes de version complètes du projet](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.5.0)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
