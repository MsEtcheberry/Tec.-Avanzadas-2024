
# API de Apuestas de Carreras de Caballos

API REST para el desarrollo de un sitio web en el que se pueden gestionar usuarios, caballos, carreras y realizar apuestas.

## Correr el servidor:
### Instalación
Primero debe clonarse el repositorio de manera local e instalar las dependencias.

1. Clonar el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```

2. Instalar las dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor:
   ```bash
   npm start
   ```

4. Crear un archivo `.env` en la carpeta root siguiendo el modelo del `.env.example`. Deben completarse los siguientes datos:
   ```
   PORT = _____ (Ingresar número de puerto a utilizar)
   DB_URI = ______ (Ingresar connection string de MongoDB)
   TOKEN_KEY = ______ (Ingresar una key aleatoria)
   ```

5. Finalmente, usar el comando `node index.js` para correr el servidor.

## Características de la API

#### +POST('/auth/login')
- Respuestas:
  * 200 (Success). Devuelve un atributo Token válido por una hora para el futuro uso de endpoints privados.
    ```json
    {
      "data": {
        "token": "xxxxxxxxxxx"
      }
    }
    ```
  * 401 (Fail). Credenciales incorrectas.
  * 500 Error interno del servidor.
  * 
- Ejemplo:
  - Ruta: `http://localhost:<PORT>/auth/login`
  - Body:
    ```json
    {
      "email": "prueba@fullstack.com",
      "password": "123456"
    }
    ```

#### +POST('/users')
- Crea un nuevo usuario.
- Requiere que se pasen mediante el body de la request los siguientes datos: `displayName`, `identificationNumber`, `email`, `role`, `password`.

- Respuestas:
  * 201 (Success). El usuario fue creado correctamente.
  * 409 No pudo crearse el usuario (Datos faltantes o ya hay un usuario con el email indicado).
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/users`
  - Body:
    ```json
    {
      "displayName": "Usuario1",
      "identificationNumber": "12345678",
      "email": "usuario1@fullstack.com",
      "role": "user",
      "password": "password123"
    }
    ```

#### +GET('/users')
- Se puede pasar `limit` y `offset` como parámetros en la URL.

- Respuestas:
  * 200 (Success). Devuelve un array de usuarios.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/users`

#### +GET('/horses')
- Se puede pasar `limit` y `offset` como parámetros en la URL.

- Respuestas:
  * 200 (Success). Devuelve un array de caballos.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/horses`

### Requieren enviar un Token válido en el header de la request para publicar/actualizar los registros.

#### +POST('/horses')
- Requiere pasar los siguientes datos obligatorios dentro del body de la request: `displayName` (String), `winningRate` (Number).

- Respuestas:
  * 201 (Success). El caballo fue creado correctamente.
  * 409 Error. Datos faltantes o ya existe un caballo con el mismo nombre.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/horses`
  - Body:
    ```json
    {
      "displayName": "Caballo1",
      "winningRate": 0.75
    }
    ```

#### +DELETE('/horses/:id')
- Requiere pasar el ID del caballo como parámetro en la URL.

- Respuestas:
  * 204 (Success). El caballo fue eliminado con éxito.
  * 404 No se encontró el caballo.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/horses/12345678`

#### +GET('/nextRaces')
- Se puede pasar `limit` y `offset` como parámetros en la URL.

- Respuestas:
  * 200 (Success). Devuelve un array de las próximas carreras, es decir, aquellas cuya raceDateTime es mayor al currentTime.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/nextRaces`

#### +GET('/races')
- Se puede pasar `limit` y `offset` como parámetros en la URL.

- Respuestas:
  * 200 (Success). Devuelve un array de carreras.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/races`

#### +GET('/races/:id/bets')
- Requiere pasar el ID de la carrera como parámetro en la URL.
- Se puede pasar `limit` y `offset` como parámetros en la URL.

- Respuestas:
  * 200 (Success). Devuelve un array de apuestas para la carrera indicada.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/races/12345678/bets`

#### +PUT('/races/:id/horses')
- Requiere pasar el ID de la carrera como parámetro en la URL y el ID del caballo en el body de la request.

- Respuestas:
  * 200 (Success). El caballo fue agregado a la carrera correctamente.
  * 404 No se encontró el caballo.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/races/12345678/horses`
  - Body:
    ```json
    {
      "horseId": "87654321"
    }
    ```

#### +POST('/races/:id/finish')
- Requiere pasar el ID de la carrera como parámetro en la URL.

- Respuestas:
  * 200 (Success). La carrera fue finalizada correctamente.
  * 400 Error. No se pudo finalizar la carrera.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/races/12345678/finish`

#### +POST('/races')
- Requiere pasar los siguientes datos obligatorios dentro del body de la request: `raceName` (String), `raceDateTime` (Date).

- Respuestas:
  * 201 (Success). La carrera fue creada correctamente.
  * 409 Error. Datos faltantes o ya existe una carrera con el mismo nombre.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/races`
  - Body:
    ```json
    {
      "raceName": "Carrera1",
      "raceDateTime": "2023-12-01T10:00:00Z"
    }
    ```

#### +POST('/bets')
- Requiere pasar los siguientes datos obligatorios dentro del body de la request: `amount` (Number), `userId` (String), `raceId` (String), `horseId` (String).

- Respuestas:
  * 201 (Success). La apuesta fue registrada con éxito.
  * 404 No se encontró la carrera o el usuario.
  * 409 Error. Datos faltantes o ya existe una apuesta similar.
  * 500 Error interno del servidor.

- Ejemplo:
  - Ruta: `http://localhost:<PORT>/bets`
  - Body:
    ```json
    {
      "amount": 100,
      "userId": "12345678",
      "raceId": "87654321",
      "horseId": "56789012"
    }
    ```

