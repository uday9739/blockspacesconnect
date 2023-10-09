pipeline {
    agent any

    stages {
        stage('Clone SourceRepo') {
            steps {
                script {
                    // Define your SourceRepo URL and credentials
                    def sourceRepoURL = 'git@bitbucket.org:blockspacesio/blockspacesconnect.git'
                    def sourceRepoCredentials = credentials('your-source-credentials-id')
                    
                    // Specify the directory to be copied from SourceRepo
                    def sourceDirectory = 'blockspacesconnect/shared'

                    // Clone the SourceRepo
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: 'master']], // Change to the branch you want to clone
                        userRemoteConfigs: [[
                            url: sourceRepoURL,
                            credentialsId: sourceRepoCredentials
                        ]]
                    ])
                }
            }
        }

        stage('Clone TargetRepo') {
            steps {
                script {
                    // Define your TargetRepo URL and credentials
                    def targetRepoURL = 'git@bitbucket.org:blockspacesio/admin-portal.git'
                    def targetRepoCredentials = credentials('your-target-credentials-id')
                    
                    // Specify the destination directory in TargetRepo
                    def targetDirectory = 'admin-portal/admin-api/'

                    // Clone the TargetRepo
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: 'master']], // Change to the branch you want to clone
                        userRemoteConfigs: [[
                            url: targetRepoURL,
                            credentialsId: targetRepoCredentials
                        ]]
                    ])
                }
            }
        }

        stage('Copy Directory to TargetRepo') {
            steps {
                script {
                    // Specify the source and target directories
                    def sourceDirectory = 'blockspacesconnect/shared'
                    def targetDirectory = 'admin-portal/admin-api/'

                    // Copy the directory from SourceRepo to TargetRepo
                    sh "cp -r ${sourceDirectory} ${targetDirectory}"

                    // Commit and push changes to TargetRepo
                    sh """
                        cd ${targetDirectory}
                        git add .
                        git commit -m "Copy directory from SourceRepo"
                        git push origin master
                    """
                }
            }
        }
    }
}
