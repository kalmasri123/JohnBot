
pipeline {
    agent any 
    environment {
        IMAGE_NAME = "johnbot"
        REGISTRY_CREDENTIALS = 'johnserver:Johnpass123'
    }
    stages {
        stage('Clone Repository') {
            steps {
                checkout scm
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    // Builds the image and tags it with the build number and 'latest'
                    dockerImage = docker.build("${IMAGE_NAME}:${env.BUILD_NUMBER}", "-t ${IMAGE_NAME}:latest .")
                }
            }
        }
        stage('Publish Docker Image') {
            steps {
                // Uses withDockerRegistry to manage authentication for pushing
                withDockerRegistry(credentialsId: "${REGISTRY_CREDENTIALS}", url: "http://docker.johnserver.com") {
                    script {
                        // Pushes both the build-numbered and 'latest' tags
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }
        stage('Cleanup') {
            steps {
                // Optional: Removes the local image to free up space
                sh "docker rmi ${IMAGE_NAME}:${env.BUILD_NUMBER}"
                sh "docker rmi ${IMAGE_NAME}:latest"
            }
        }
    }
}
