# 1. Usa o Java 21
FROM eclipse-temurin:21-jdk

# 2. Copia o arquivo .jar para dentro da imagem
COPY target/*.jar app.jar

# 3. Expõe a porta 8080
EXPOSE 8080

# 4. Diz ao Docker qual comando rodar quando o contêiner iniciar
ENTRYPOINT ["java", "-jar", "/app.jar"]