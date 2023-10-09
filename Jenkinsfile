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

                    // Clone the SourceRepo into a unique workspace subdirectory
                    dir('sourceRepo') {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: 'main']], // Change to the branch you want to clone
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
                    
                    // Specify the destination directory in TargetRepo
                    def targetDirectory = 'admin-portal/admin-api/'

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
        stage('Copy Folder from Source to Target') {
    steps {
        script {
            // Define the source and target directories
            def sourceRepoDir = "${WORKSPACE}/sourceRepo/shared"
            def targetRepoDir = "${WORKSPACE}/targetRepo/admin-api"

            // Copy the contents from source to target directory
            sh "cp -r ${sourceRepoDir}/* ${targetRepoDir}/"

            // Commit and push the changes to the target repository
            dir("${WORKSPACE}/targetRepo") {
                gitAdd()
                gitCommit(message: "Copy folder from source to target")
                gitPush()
            }
        }
    }
}

     }
}

