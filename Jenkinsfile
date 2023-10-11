pipeline {
    agent any

    stages {
        stage('Clone SourceRepo') {
            steps {
                script {
                    // Define your SourceRepo URL and credentials
                    def sourceRepoURL = 'https://github.com/uday9739/blockspacesconect.git'

                    // Clone the SourceRepo into a unique workspace subdirectory
                    dir('sourceRepo') {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: 'feature/admin-portal']],
                            userRemoteConfigs: [[
                                url: sourceRepoURL,
                                credentialsId: 'b38781a2-0e17-4055-ae1a-c54fff40b5dd'             
                             ]]
                        ])
                    }
                }
            }
        }
        stage('Clone TargetRepo') {
            steps {
                script {
                    // Define your TargetRepo URL and credentials
                    def targetRepoURL = 'https://github.com/uday9739/admin-portal.git'

                    // Clone the TargetRepo into a unique workspace subdirectory
                    dir('targetRepo') {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: 'main']],
                            userRemoteConfigs: [[
                                url: targetRepoURL,
                                credentialsId: 'b38781a2-0e17-4055-ae1a-c54fff40b5dd'
                            ]]
                        ])
                    }
                }
            }
        }

     }

}
