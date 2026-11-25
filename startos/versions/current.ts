import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.6.0:0',
  releaseNotes: {
    en_US: `Updated Garage to 2.6.0.

**Features**

- New: Web Admin interface, Garage's built-in web UI for managing buckets, keys, permissions and the cluster. Sign in with your admin token.

**Security**

- Copying an object now respects bucket quotas
- Fixed a crash from malformed browser-form uploads

**Fixes**

- Fixed object listings that start after a key preceding the prefix
- More reliable handling of cancelled uploads
- Presigned URLs with unsigned checksum parameters are accepted
- Compressed blocks are no longer stored when larger than the original

[Full upstream release notes](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.6.0)`,
    es_ES: `Actualizado Garage a 2.6.0.

**Novedades**

- Nuevo: interfaz Administración web, la interfaz web integrada de Garage para gestionar buckets, claves, permisos y el clúster. Inicie sesión con su token de administrador.

**Seguridad**

- Copiar un objeto ahora respeta las cuotas del bucket
- Corregido un fallo causado por subidas de formularios de navegador malformadas

**Correcciones**

- Corregidos los listados de objetos que empiezan tras una clave anterior al prefijo
- Gestión más fiable de las subidas canceladas
- Se aceptan URL prefirmadas con parámetros de suma de comprobación sin firmar
- Los bloques comprimidos ya no se almacenan cuando son más grandes que el original

[Notas completas de la versión original](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.6.0)`,
    de_DE: `Garage auf 2.6.0 aktualisiert.

**Funktionen**

- Neu: Schnittstelle Web-Administration, die integrierte Weboberfläche von Garage zur Verwaltung von Buckets, Schlüsseln, Berechtigungen und dem Cluster. Mit dem Admin-Token anmelden.

**Sicherheit**

- Das Kopieren eines Objekts beachtet jetzt Bucket-Kontingente
- Absturz durch fehlerhafte Browser-Formular-Uploads behoben

**Fehlerbehebungen**

- Objektlisten, die nach einem Schlüssel vor dem Präfix beginnen, korrigiert
- Zuverlässigere Behandlung abgebrochener Uploads
- Vorsignierte URLs mit unsignierten Prüfsummenparametern werden akzeptiert
- Komprimierte Blöcke werden nicht mehr gespeichert, wenn sie größer als das Original sind

[Vollständige Upstream-Versionshinweise](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.6.0)`,
    pl_PL: `Zaktualizowano Garage do 2.6.0.

**Nowości**

- Nowy: interfejs Panel administracyjny, wbudowany interfejs WWW Garage do zarządzania bucketami, kluczami, uprawnieniami i klastrem. Zaloguj się tokenem administratora.

**Bezpieczeństwo**

- Kopiowanie obiektu uwzględnia teraz limity bucketa
- Naprawiono awarię spowodowaną nieprawidłowymi przesyłaniami z formularzy przeglądarki

**Poprawki**

- Naprawiono listowanie obiektów zaczynające się po kluczu poprzedzającym prefiks
- Bardziej niezawodna obsługa anulowanych przesyłań
- Akceptowane są adresy URL z podpisem wstępnym zawierające niepodpisane parametry sum kontrolnych
- Skompresowane bloki nie są już zapisywane, gdy są większe niż oryginał

[Pełne informacje o wydaniu upstream](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.6.0)`,
    fr_FR: `Garage mis à jour vers 2.6.0.

**Fonctionnalités**

- Nouveau : interface Administration web, l’interface web intégrée de Garage pour gérer les buckets, les clés, les permissions et le cluster. Connectez-vous avec votre jeton administrateur.

**Sécurité**

- La copie d’un objet respecte désormais les quotas du bucket
- Correction d’un plantage causé par des envois de formulaires navigateur malformés

**Corrections**

- Correction des listes d’objets commençant après une clé antérieure au préfixe
- Gestion plus fiable des envois annulés
- Les URL présignées avec des paramètres de somme de contrôle non signés sont acceptées
- Les blocs compressés ne sont plus stockés lorsqu’ils sont plus gros que l’original

[Notes de version complètes du projet](https://git.deuxfleurs.fr/Deuxfleurs/garage/releases/tag/v2.6.0)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
