pipeline {
    agent any

    stages {
        stage('Clone SourceRepo') {
            steps {
                script {
                    // Define your SourceRepo URL and credentials
                    def sourceRepoURL = 'https://github.com/uday9739/blockspacesconect.git'
                                       
                    // Specify the directory to be copied from SourceRepo
                    def sourceDirectory = 'blockspacesconnect/shared'

                    // Clone the SourceRepo
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: 'main']], // Change to the branch you want to clone
                        userRemoteConfigs: [[
                            url: sourceRepoURL,
             
                         ]]
                    ])
                }
            }
        }

    }
}
