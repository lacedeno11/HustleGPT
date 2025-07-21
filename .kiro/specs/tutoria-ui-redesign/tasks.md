# Implementation Plan - TutorIA UI Redesign

- [x] 1. Analizar y preservar funcionalidad existente
  - Revisar el código actual en MVP/index.html, MVP/main.js, MVP/draw.js y MVP/styles.css
  - Identificar las funciones críticas que deben mantenerse
  - Documentar la integración actual con Gemini API
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Crear nueva estructura HTML con layout principal
  - Implementar el HTML base con el nuevo diseño de posicionamiento absoluto
  - Configurar el header con título "White Board"
  - Establecer el contenedor principal con dimensiones responsivas
  - _Requirements: 1.1, 5.1_

- [x] 3. Implementar sección de ejercicio compacta
  - Crear textarea compacta en la esquina superior izquierda
  - Implementar funcionalidad de copiar/pegar texto
  - Añadir estilos para que sea visualmente clara pero no intrusiva
  - Asegurar que el texto se mantenga visible y editable
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Desarrollar área principal de canvas
  - Configurar canvas HTML5 como área principal de la interfaz
  - Integrar la funcionalidad existente de draw.js
  - Asegurar que el canvas sea responsive y ocupe el área central
  - Implementar botón de limpiar canvas integrado
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Crear botones de acción en esquina superior derecha
  - Implementar botón de bombilla (💡) con estado toggle
  - Crear botón de interrogación (❓) para activar consultas
  - Añadir efectos visuales (amarillo para bombilla activa)
  - Configurar event listeners para ambos botones
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Desarrollar sección de output con input de consulta
  - Crear área de output compacta en esquina inferior derecha
  - Implementar área scrolleable para mostrar respuestas de IA
  - Añadir input de texto para consultas adicionales
  - Crear botón "Enviar" para las consultas
  - Implementar soporte para tecla Enter en el input
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Integrar funcionalidad de API de Gemini existente
  - Adaptar las llamadas existentes a la API para trabajar con el nuevo layout
  - Modificar la función de obtener pista para incluir texto del ejercicio
  - Implementar nueva función para consultas de texto desde el input
  - Mantener el prompt en español y la funcionalidad Socrática
  - _Requirements: 6.2, 4.1_

- [x] 8. Implementar estilos CSS responsivos
  - Crear estilos CSS personalizados para el posicionamiento absoluto
  - Implementar responsive design para tablet y móvil
  - Añadir animaciones y transiciones para mejor UX
  - Asegurar que todos los elementos sean visibles en diferentes tamaños
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. Añadir manejo de estados y loading
  - Implementar indicadores de carga para las consultas a la IA
  - Crear estados visuales para botones (activo/inactivo)
  - Añadir validaciones para evitar envíos vacíos
  - Implementar manejo de errores con mensajes en español
  - _Requirements: 4.2, 6.4_

- [x] 10. Realizar pruebas de integración y ajustes finales
  - Probar el flujo completo: ejercicio → dibujo → consulta → respuesta
  - Verificar responsive design en diferentes dispositivos
  - Validar que todas las funcionalidades existentes siguen funcionando
  - Realizar ajustes de UX basados en pruebas
  - _Requirements: 5.1, 5.2, 5.3, 6.4_

- [x] 11. Optimizar rendimiento y preparar para despliegue
  - Optimizar el tamaño y carga de assets
  - Verificar compatibilidad con diferentes navegadores
  - Preparar instrucciones de despliegue
  - Documentar cambios realizados
  - _Requirements: 6.4_

- [x] 12. Implementar manejo seguro de API key
  - Refactorizar main.js para cargar API key desde archivo externo
  - Crear función para cargar configuración desde .env de forma asíncrona
  - Implementar manejo de errores cuando la API key no está disponible
  - Agregar mensajes de usuario claros para configuración de API key
  - Validar que no queden API keys hardcodeadas en el código fuente
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 13. Arreglar funcionalidad del borrador
  - Corregir la conexión entre los botones de herramientas y la lógica del borrador
  - Implementar cursor circular personalizado con bordes negros para el borrador
  - Arreglar la funcionalidad de mostrar/ocultar el panel de tamaño del borrador
  - Implementar cambio de tamaño del cursor en tiempo real
  - Asegurar que el botón de borrador cambie a color naranja cuando esté activo
  - Corregir la lógica de alternancia entre lápiz y borrador
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_