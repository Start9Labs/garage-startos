import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { garageToml } from '../fileModels/garage.toml'
import { randomToken } from '../utils'

export const current = VersionInfo.of({
  version: '2.6.0:0',
  releaseNotes: {
    en_US: `Updated Garage to 2.6.0.

**Features**

- New: Web Admin interface, Garage's built-in web UI for managing buckets, keys, permissions and the cluster. Sign in with your admin token.

**Security**

- Prometheus metrics on the Admin API now require a token. If you scrape them, run Show Metrics Token and add the token to your scraper as a bearer token.
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

- Las métricas de Prometheus de la API de administración ahora requieren un token. Si las recopila, ejecute Mostrar token de métricas y añada el token a su recolector como token de portador.
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

- Die Prometheus-Metriken der Admin-API erfordern jetzt ein Token. Wenn Sie sie abrufen, führen Sie „Metrik-Token anzeigen“ aus und hinterlegen Sie das Token in Ihrem Scraper als Bearer-Token.
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

- Metryki Prometheus w API administracyjnym wymagają teraz tokenu. Jeśli je pobierasz, uruchom „Pokaż token metryk” i dodaj token do swojego scrapera jako token okaziciela.
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

- Les métriques Prometheus de l’API d’administration exigent désormais un jeton. Si vous les collectez, exécutez « Afficher le jeton de métriques » et ajoutez le jeton à votre collecteur comme jeton porteur.
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
    up: async ({ effects }) => {
      if (!(await garageToml.read((c) => c.admin.metrics_token).once())) {
        await garageToml.merge(effects, {
          admin: { metrics_token: randomToken() },
        })
      }
    },
    down: IMPOSSIBLE,
  },
})
