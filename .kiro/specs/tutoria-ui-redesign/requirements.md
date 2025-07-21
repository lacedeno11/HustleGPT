# Requirements Document - TutorIA UI Redesign

## Introduction

Este proyecto busca rediseñar la interfaz de usuario del MVP de TutorIA para mejorar la experiencia del usuario y hacer que coincida con el diseño mockup proporcionado. El objetivo es crear una interfaz más intuitiva y funcional que permita a los estudiantes trabajar de manera más eficiente con ejercicios matemáticos.

## Requirements

### Requirement 1

**User Story:** Como estudiante, quiero tener una sección dedicada para ver y editar el ejercicio, para poder trabajar con el problema de manera clara y organizada.

#### Acceptance Criteria

1. WHEN el usuario accede a la aplicación THEN el sistema SHALL mostrar una sección de ejercicio en la parte izquierda superior
2. WHEN el usuario hace clic en la sección de ejercicio THEN el sistema SHALL permitir copiar y pegar texto del ejercicio
3. WHEN el usuario ingresa texto en la sección de ejercicio THEN el sistema SHALL mantener el texto visible y editable
4. IF el usuario pega un ejercicio THEN el sistema SHALL mostrar el contenido formateado correctamente

### Requirement 2

**User Story:** Como estudiante, quiero un canvas de dibujo amplio y funcional, para poder resolver problemas matemáticos de manera visual.

#### Acceptance Criteria

1. WHEN el usuario accede a la aplicación THEN el sistema SHALL mostrar un canvas de dibujo en la parte central-izquierda
2. WHEN el usuario dibuja en el canvas THEN el sistema SHALL responder de manera fluida sin lag
3. WHEN el usuario termina de dibujar THEN el sistema SHALL mantener todos los trazos visibles
4. WHEN el usuario necesita limpiar el canvas THEN el sistema SHALL proporcionar una opción de borrar

### Requirement 3

**User Story:** Como estudiante, quiero botones de acción intuitivos (bombilla y signo de interrogación), para poder solicitar ayuda de manera fácil.

#### Acceptance Criteria

1. WHEN el usuario ve la interfaz THEN el sistema SHALL mostrar un botón de bombilla en la parte superior derecha
2. WHEN el usuario hace clic en la bombilla THEN el sistema SHALL cambiar el color a amarillo para indicar activación
3. WHEN el usuario ve la interfaz THEN el sistema SHALL mostrar un botón de signo de interrogación
4. WHEN el usuario hace clic en el signo de interrogación THEN el sistema SHALL activar la funcionalidad de obtener pista

### Requirement 4

**User Story:** Como estudiante, quiero ver las respuestas y pistas de la IA en una sección dedicada, para poder revisar la ayuda recibida sin que interfiera con mi trabajo.

#### Acceptance Criteria

1. WHEN el usuario solicita una pista THEN el sistema SHALL mostrar la respuesta en un cuadro en la parte inferior derecha
2. WHEN la IA está procesando THEN el sistema SHALL mostrar un indicador de carga en el área de output
3. WHEN se recibe una respuesta THEN el sistema SHALL mostrar el texto de manera clara y legible
4. WHEN hay múltiples interacciones THEN el sistema SHALL mantener un historial visible de las respuestas

### Requirement 5

**User Story:** Como estudiante, quiero una interfaz responsive y bien organizada, para poder usar la aplicación en diferentes dispositivos.

#### Acceptance Criteria

1. WHEN el usuario accede desde desktop THEN el sistema SHALL mostrar el layout de 4 secciones como en el mockup
2. WHEN el usuario accede desde tablet THEN el sistema SHALL adaptar el layout manteniendo la funcionalidad
3. WHEN el usuario accede desde móvil THEN el sistema SHALL reorganizar las secciones de manera vertical
4. WHEN el usuario redimensiona la ventana THEN el sistema SHALL ajustar los elementos proporcionalmente

### Requirement 6

**User Story:** Como desarrollador, quiero mantener la funcionalidad existente de la API de Gemini, para asegurar que las mejoras de UI no rompan la funcionalidad core.

#### Acceptance Criteria

1. WHEN se rediseña la interfaz THEN el sistema SHALL mantener toda la funcionalidad de draw.js
2. WHEN se implementa el nuevo layout THEN el sistema SHALL conservar la integración con Gemini API
3. WHEN se actualiza el CSS THEN el sistema SHALL seguir usando Tailwind CSS como framework
4. WHEN se despliega la nueva versión THEN el sistema SHALL funcionar sin errores en el flujo completo