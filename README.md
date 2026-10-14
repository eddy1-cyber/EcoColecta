# EcoColecta

Prototipo comunitario para encontrar puntos de reciclaje, proponer nuevos puntos y registrar entregas de materiales recuperables.

## Funcionalidades

- Consulta de puntos de reciclaje y de los materiales que reciben.
- Registro de entregas con nombre, punto, material y peso.
- Registro de nuevos puntos comunitarios.
- Resumen de puntos, entregas y peso recuperado.
- Persistencia local en el navegador mediante `localStorage`; los datos no se comparten entre dispositivos.

## Ejecutar el prototipo

Abre `index.html` en un navegador moderno. No requiere dependencias ni servidor. Los datos de ejemplo aparecen al abrirlo por primera vez.

## Investigación: evolución del control de versiones

### De sistemas centralizados a distribuidos

En un sistema centralizado como SVN, un servidor mantiene el historial oficial y los clientes consultan o envían cambios a ese servidor. El modelo facilita la administración central, pero el trabajo y el historial dependen de la disponibilidad del servidor.

Git es distribuido: cada clon contiene el historial completo y permite crear commits, ramas y fusiones localmente, incluso sin conexión. La colaboración se sincroniza después con uno o más repositorios remotos. Esto hace que Git no dependa de un único servidor para el trabajo cotidiano, aunque el equipo sí necesita acordar cómo compartir y revisar los cambios.

### Git y GitHub

Git es la herramienta de control de versiones que se ejecuta localmente: registra cambios, crea commits y administra ramas. GitHub es una plataforma remota que aloja repositorios Git y agrega herramientas de colaboración, como Pull Requests, Issues, Projects y GitHub Actions. Git puede utilizarse sin GitHub y GitHub no sustituye los comandos ni el historial local de Git.

### Arquitectura cliente-servidor y Git distribuido

En una aplicación cliente-servidor, como la versión futura de EcoColecta, los navegadores (clientes) solicitarían y enviarían datos a una API y a una base de datos central. Esa fuente compartida permitiría que ciudadanos y administradores consultaran información actualizada desde distintos dispositivos.

El repositorio Git central/remoto cumple otro propósito: compartir y revisar el código del proyecto. Cada integrante conserva un clon completo y puede trabajar localmente; el remoto de GitHub facilita sincronizar ramas y aceptar cambios mediante PR. No es la base de datos de la aplicación ni almacena los registros de reciclaje de sus usuarios. Este prototipo guarda sus datos solo en el navegador con `localStorage`, por lo que no ofrece sincronización entre personas.

## Preparación de Git y acceso seguro

Configura tu identidad global con el nombre y correo que quieras asociar a tus commits:

```bash
git config --global user.name "Tu nombre"
git config --global user.email "tu-correo@example.com"
git config --global --list
```

Para configurar SSH en Windows con OpenSSH:

```powershell
ssh-keygen -t ed25519 -C "tu-correo@example.com"
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
ssh-add $env:USERPROFILE\.ssh\id_ed25519
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard
```

Agrega la llave **pública** copiada en GitHub → Settings → SSH and GPG keys y verifica la conexión con `ssh -T git@github.com`. Nunca compartas ni subas `id_ed25519` (la llave privada). Si el servicio de agente no está disponible en el equipo, usa el método de inicio de agente recomendado por la configuración de Windows.

## Colaboración en GitHub

1. Definan entre los integrantes si el repositorio será público o privado y agreguen como colaboradores a quienes lo necesiten. Al clonar/configurar el remoto, usen la URL SSH si eligieron este método de acceso.
2. Creen un GitHub Project compartido con las columnas **To Do**, **In Progress**, **In Review** y **Done**. Agreguen el campo de estado correspondiente y vinculen el repositorio.
3. Creen y asignen Issues para la pantalla de inicio, el registro/consulta de puntos, el registro de entregas y la automatización. Cada integrante debe tener trabajo asignado.
4. Protejan `main`: deshabiliten los pushes directos y requieran Pull Request y aprobación de otra persona antes de fusionar.
5. Por cada Issue, creen una rama con el formato `feature/nombre-funcionalidad`, por ejemplo `feature/registro-entregas`. No hagan commits directamente en `main`.
6. Abran un PR hacia `main`, incluyan `Closes #<número-de-issue>` en su descripción y pidan revisión a un compañero. El autor no debe aprobar su propio PR.
7. Usen la vista de ramas de VS Code, GitHub Desktop o GitKraken para revisar el historial y registrar los commits de cada integrante.

### `pull`, `push`, merge y rebase

- `git pull` trae los cambios remotos y los integra en la rama actual (normalmente mediante merge); `git push` publica los commits locales en el remoto.
- `git merge otra-rama` integra los cambios de otra rama y conserva la historia de ambas líneas de trabajo, normalmente con un commit de merge.
- `git rebase otra-rama` vuelve a aplicar los commits propios encima de la rama indicada para crear una historia lineal. Cambia los identificadores de esos commits; no reescriban ramas compartidas o ya publicadas sin coordinación.

### Reto de resolución de conflictos

Para repetir la práctica en equipo, creen dos ramas desde la misma base y editen intencionalmente la misma línea de este README con textos distintos. Confirmen ambos cambios y fusionen una rama sobre la otra. Ante los marcadores `<<<<<<<`, `=======` y `>>>>>>>`, acuerden el texto final, eliminen los marcadores, verifiquen el resultado y confirmen la resolución. Documenten en el Issue o PR qué se conservó y por qué; no integren marcadores de conflicto en `main`.

#### Simulación realizada

Se partió del mismo commit en `practice/conflicto-integrante-a` y `practice/conflicto-integrante-b`. Ambas ramas cambiaron la descripción inicial de este README con propuestas distintas y se confirmaron por separado. Al ejecutar `git merge --no-commit --no-ff practice/conflicto-integrante-b` desde la rama A, Git informó un conflicto de contenido en `README.md` y mostró las dos versiones entre marcadores.

La resolución combinó el propósito de ambas propuestas en una sola descripción: “Prototipo comunitario para encontrar puntos de reciclaje, proponer nuevos puntos y registrar entregas de materiales recuperables.” Se eliminaron todos los marcadores, se revisó el archivo y se confirmó la resolución en el commit de merge. La simulación representa el trabajo de dos integrantes mediante ramas locales; para completar el requisito de revisión entre personas, cada integrante debe realizar su propio cambio y el compañero debe revisar el PR.

#### Práctica de `pull`, `push`, merge y rebase

En un clon con el remoto `origin` configurado:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/registro-entregas
# hacer cambios, confirmarlos y publicarlos:
git push -u origin feature/registro-entregas
```

`pull` descarga cambios del remoto y los integra en la rama actual; con `--ff-only` no crea un merge inesperado. `push` publica commits locales en el remoto, y `-u` configura el seguimiento de esa rama. No se debe publicar directamente `main`; publiquen la rama y abran un PR.

Para comparar la integración de dos ramas, sobre ramas de práctica:

```bash
git switch feature/registro-entregas
git merge --no-ff feature/otra-funcionalidad
```

El merge conserva ambas líneas de historia y crea un commit de merge. Como comparación, desde una rama de práctica propia:

```bash
git switch feature/otra-funcionalidad
git rebase feature/registro-entregas
```

El rebase vuelve a aplicar los commits propios sobre la punta de la rama indicada, dejando una historia lineal y cambiando los identificadores de los commits reescritos. Merge y rebase pueden producir conflictos si ambos tocaron la misma zona; resuélvelos antes de continuar. No hagas rebase de ramas compartidas o publicadas sin coordinación.

En esta práctica, el merge de las dos descripciones sí produjo el conflicto esperado. También se usa una rama de práctica separada para rebase sin modificar `main`. La sincronización de `pull` y el `push` se deben hacer contra el remoto del equipo y verificarse antes de abrir el PR.

## Automatización

El workflow [`.github/workflows/main.yml`](.github/workflows/main.yml) se ejecuta en cada push y Pull Request hacia `main`. Comprueba la sintaxis de JavaScript con `node --check` y busca errores de whitespace en el diff con `git diff --check`. Un PR debe pasar estas verificaciones antes de integrarse.
