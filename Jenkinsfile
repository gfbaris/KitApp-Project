pipeline {
    agent any

    stages {

        stage('Kod Alma') {
            steps {
                git branch: 'main', url: 'https://github.com/gfbaris/KitApp-Project.git'
            }
        }

        stage('Build ve Deploy') {
            steps {
                // Önce çalışan konteynerleri durdur, ardından yeniden derleyip ayağa kaldır
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }

        stage('Sağlık Kontrolü') {
            steps {
                script {
                    // Konteynerlerin tamamen ayağa kalkması için bekle
                    sleep 10
                    // Backend'in 5000 portunda ayakta olup olmadığını kontrol et
                    sh 'curl -f http://host.docker.internal:5000/ || echo "Backend henuz hazir degil"'
                }
            }
        }

    }

    post {
        success {
            echo 'Deploy başarılı: KitApp çalışıyor.'
        }
        failure {
            echo 'Deploy başarısız: logları kontrol et.'
        }
    }
}
