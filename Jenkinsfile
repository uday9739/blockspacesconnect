//def SLACK_THREAD

pipeline {
  agent any
  options {
    disableConcurrentBuilds(abortPrevious: true)
  }
  environment {
    DATE = sh(script: "date +'%Y-%m-%d'", returnStdout: true).trim()
    COMMITTER_NAME = sh(script: 'git show -s --pretty=%an', returnStdout: true).trim()
    DOCKER_TAG = sh(script: 'npm run bsc:version --silent', returnStdout: true).trim()
    SONAR_URL = 'https://codequality.blockspaces.dev'
    SONAR_SCANNER_PATH = '/opt/sonar-scanner-4.7.0.2747-linux/bin'
    SONAR_TOKEN = credentials('SONAR_API_KEY')
    CYPRESS_TOKEN= credentials('CYPRESS_API_KEY')
    DOCKER_LOGIN = credentials('DOCKERHUB')
    MONGODB_STG_URL = credentials('STG_MONGO_URL')
    MONGODB_PROD_URL = credentials ('PROD_MONGO_URL')
    STAGING_URL = 'https://staging.blockspaces.dev'
    NAME = sh(returnStdout: true, script: 'npm pkg get name').trim().replaceAll('"', '')
    VERSION = sh(returnStdout: true, script: 'npm pkg get version').trim().replaceAll('"', '')
    SLACK_THREAD = ""
  }
  stages {
    stage('Slack msg') {
      steps {
        script {
        def slackResponse = slackSend(color: "good",
        message: "Application: ${NAME}-${VERSION}_${BUILD_NUMBER}\nStarting Jenkins Pipeline Branch: ${env.BRANCH_NAME}\nJob Name: ${env.JOB_NAME}\nContributor: ${COMMITTER_NAME}, Build URL: (<${env.BUILD_URL}console|Open>)")
        SLACK_THREAD = slackResponse.threadId
      }
      }
  }
    stage('NPM CI & audit') {
      when {
        anyOf {
          branch 'staging';
         }
      }
      steps {
        script {
          try {
        sh 'npm ci';
        //sh 'npm audit --audit-level=none'
        dir('core') {
        sh 'npm ci';
        //sh 'npm audit --audit-level=none'
      }
        dir('frontend') {
        sh 'npm ci';
        //sh 'npm audit --audit-level=none'
      }
        dir('shared') {
        sh 'npm ci';
        //sh 'npm audit --audit-level=none'
      }
      slackSend(color: "good", channel: SLACK_THREAD, message: "Completed NPM CI & Audit")
    }
    catch (Exception error) {
    slackSend(color: "danger", channel: SLACK_THREAD, message: "Failed NPM ci and audit with: ${error.toString()}")
    error("Stop pipeline")
    }
        }
      }
  }
      stage('Test') {
      when {
        anyOf {
          branch 'staging';
          branch 'feature/*';
          branch 'bugfix/*';
          branch 'BSPLT-*';
        }
      }
      steps {
        script {
          try {
        echo "Initiating the tests for the commit ID - ${env.GIT_COMMIT}, made by ${COMMITTER_NAME}"
        echo "Installing the NodeJS dependencies for the ${env.GIT_BRANCH} branch..."
        sh 'npm run bsc:install:clean'
        dir('core') {
          echo "Performing the unit tests for the ${env.GIT_BRANCH} branch, core application..."
          sh 'npm run test'
        }
         slackSend(color: "good", channel: SLACK_THREAD, message: "Completed Test stage for staging branches.")
          }
          catch (Exception error) {
    slackSend(color: "danger", channel: SLACK_THREAD, message: "Test stage failed with: ${error.toString()}")
    error("Stop pipeline")
    }
        }
        }
    }
      stage('Build-feature/bugfix/BSPLT') {
        environment {
        ENVIRONMENT = 'staging'
      }
        when {
        anyOf {
          branch 'feature/*';
          branch 'bugfix/*';
          branch 'BSPLT-*';
         }
      }
      steps {
        script{
          try {
        echo "Initiating the docker build for the commit ID - ${env.GIT_COMMIT}, made by ${COMMITTER_NAME}..."
        echo "Authenticating with Docker Hub..."
        sh 'echo $DOCKER_LOGIN_PSW | docker login -u $DOCKER_LOGIN_USR --password-stdin'
        echo "Preparing the docker build environment..."
        sh 'cp core/.env.${ENVIRONMENT} core/.env'
        sh 'cp frontend/connect-ui/.env.${ENVIRONMENT} frontend/connect-ui/.env'
        sh 'npm run bsc:install:clean'
        sh 'npm run bsc:install'
        echo "Performing the build ..."
        sh 'docker compose --profile core --env-file frontend/connect-ui/.env build --build-arg NODE_ENV=${ENVIRONMENT}'
        }
      catch (Exception error) {
    slackSend(color: "danger", channel: SLACK_THREAD, message: "Build failed for feature/bugfix/BSPLT branch with: ${error.toString()}")
    error("Stop pipeline")
    }
        }
      }
    }
    stage('Build-Stg') {
      environment {
        ENVIRONMENT = 'staging'
      }
        when {
        anyOf {
          branch 'staging';
         }
      }
      steps {
        script {
          try {
        echo "Initiating the docker build for the commit ID - ${env.GIT_COMMIT}, made by ${COMMITTER_NAME}..."
        echo "Authenticating with Docker Hub..."
        sh 'echo $DOCKER_LOGIN_PSW | docker login -u $DOCKER_LOGIN_USR --password-stdin'
        echo "Preparing the docker build environment..."
        sh 'cp core/.env.${ENVIRONMENT} core/.env'
        sh 'cp frontend/connect-ui/.env.${ENVIRONMENT} frontend/connect-ui/.env'
        sh 'npm run bsc:install:clean'
        echo "Performing the build ..."
        sh 'docker compose --profile core --env-file frontend/connect-ui/.env build --build-arg NODE_ENV=${ENVIRONMENT}'
        echo "Uploading the docker images to the Docker Hub repository..."
        sh 'docker compose push bsc-core bsc-frontend'
        slackSend(color: "good", channel: SLACK_THREAD, message: "Completed Build-Staging")
      }
      catch (Exception error) {
    slackSend(color: "danger", channel: SLACK_THREAD, message: "Failed Build-Staging with: ${error.toString()}")
    error("Stop pipeline")
    }
        }
      }
    }
    stage('Build-Prod') {
      environment {
        ENVIRONMENT = 'production'
      }
        when {
        anyOf {
          branch 'production';
         }
      }
      steps {
        script {
        try {
        echo "Creating a temp directory"
        sh 'mkdir ${WORKSPACE}/mongodb-dump'
        
        echo "Mongodb atlas database dump"
        sh 'mongodump --uri=$MONGODB_PROD_URL --out=${WORKSPACE}/mongodb-dump'

        echo "Archive the dump folder"
        sh 'tar -czf mongodb-backup-#${BUILD_NUMBER}-v${VERSION}-${DATE}.tar.gz -P ${WORKSPACE}/mongodb-dump'

        echo "Uploading to the s3 bucket"
        sh 'aws s3 cp mongodb-backup-#${BUILD_NUMBER}-v${VERSION}-${DATE}.tar.gz s3://mongo-atlas-prod-backup/ --profile prod'

        echo "Initiating the docker build for the commit ID - ${env.GIT_COMMIT}, made by ${COMMITTER_NAME}..."
        echo "Authenticating with Docker Hub..."
        sh 'echo $DOCKER_LOGIN_PSW | docker login -u $DOCKER_LOGIN_USR --password-stdin'
        echo "Preparing the docker build environment..."
        sh 'cp core/.env.${ENVIRONMENT} core/.env'
        sh 'cp frontend/connect-ui/.env.${ENVIRONMENT} frontend/connect-ui/.env'
        sh 'npm run bsc:install:clean'
        echo "Performing the build ..."
        sh 'docker compose --profile core --env-file frontend/connect-ui/.env build'
        echo "Uploading the docker images to the Docker Hub repository..."
        sh 'docker compose push bsc-core bsc-frontend'
        slackSend(color: "good", channel: SLACK_THREAD, message: "Completed Build-Prod")
      }
    catch (Exception error) {
    slackSend(color: "danger", channel: SLACK_THREAD, message: "Production build stage failed with: ${error.toString()}")
    error("Stop pipeline")
    }
        }
      }
    }
stage('Deploy-Stg') {
  environment {
        ENVIRONMENT = 'staging'
      }
      when {
        anyOf {
          branch 'staging';
         }
      }
      steps {
      script {
      try {
        echo "Applying the K8S manifest file updates..."
        sh 'kubectl --context arn:aws:eks:us-east-1:278428321638:cluster/blockspaces-connect-staging apply -f k8s/staging/bsc-stg_deployment.yaml'
        echo "Deploying the frontend application..."
        sh 'kubectl --context arn:aws:eks:us-east-1:278428321638:cluster/blockspaces-connect-staging set image deployment/bsc-frontend-${ENVIRONMENT} bsc-frontend-${ENVIRONMENT}=blockspacesteam/bsc-frontend:${DOCKER_TAG}-${ENVIRONMENT} -n bsc-${ENVIRONMENT}'
        echo "Deploying the core application..."
        sh 'kubectl --context arn:aws:eks:us-east-1:278428321638:cluster/blockspaces-connect-staging set image deployment/bsc-core-${ENVIRONMENT} bsc-core-${ENVIRONMENT}=blockspacesteam/bsc-core:${DOCKER_TAG}-${ENVIRONMENT} -n bsc-${ENVIRONMENT}'
        slackSend(color: "good", channel: SLACK_THREAD, message: "Completed Deploy-Stg")
  }
  catch (Exception error) {
    slackSend(color: "danger", channel: SLACK_THREAD, message: "Deploy-Stg failed with: ${error.toString()}")
    error("Stop pipeline")
    }
      }
      }
}
stage('Deploy-Prod') {
  environment {
        ENVIRONMENT = 'production'
      }
      when {
        anyOf {
          branch 'production';
         }
      }
      steps {
      script {
      try {
        echo "Applying the K8S manifest file updates..."
        sh 'kubectl --context arn:aws:eks:us-east-1:278428321638:cluster/blockspaces-connect-production apply -f k8s/prod/bsc-prod_deployment.yaml'
        echo "Deploying the frontend application..."
        sh 'kubectl --context arn:aws:eks:us-east-1:278428321638:cluster/blockspaces-connect-production set image deployment/bsc-frontend-${ENVIRONMENT} bsc-frontend-${ENVIRONMENT}=blockspacesteam/bsc-frontend:${DOCKER_TAG}-${ENVIRONMENT} -n bsc-${ENVIRONMENT}'
        echo "Deploying the core application..."
        sh 'kubectl --context arn:aws:eks:us-east-1:278428321638:cluster/blockspaces-connect-production set image deployment/bsc-core-${ENVIRONMENT} bsc-core-${ENVIRONMENT}=blockspacesteam/bsc-core:${DOCKER_TAG}-${ENVIRONMENT} -n bsc-${ENVIRONMENT}'
        slackSend(color: "good", channel: SLACK_THREAD, message: "Completed Deploy-Prod")  
        }
      
      catch (Exception error) {
    slackSend(color: "danger", channel: SLACK_THREAD, message: "Deploy-Prod stage failed with: ${error.toString()}")
    error("Stop pipeline")
    }
   }
  }
}
    stage('Migration-Stg') {
      environment {
        ENVIRONMENT = 'staging'
      }
      when {
        anyOf {
          branch 'staging';
        }
      }
      steps {
        script {
          try {
            sleep(time: 5, unit: 'MINUTES')
            //echo "Installing the core project NodeJS dependencies..."
            //sh 'npm ci'
            echo "Installing the NodeJS dependencies (MongoDB migration project), executing the MongoDB migration script..."
            dir('db-migrations') {
              sh 'npm ci'
              sh 'npm run migrate -- --mongodb-url="$MONGODB_STG_URL"'
            }
            slackSend(color: "good", channel: SLACK_THREAD, message: "Completed Migration-Stg")
          }
          catch (Exception error) {
            slackSend(color: "danger", channel: SLACK_THREAD, message: "Failed Migration-Stg with: ${error.toString()}")
            error("Stop pipeline")
          }
        }
      }
    }
    stage('Migration-Prod') {
      environment {
        ENVIRONMENT = 'production'
      }
      when {
        anyOf {
          branch 'production';
        }
      }
      steps {
        script {
          try {
            sleep(time: 5, unit: 'MINUTES')
            //echo "Installing the core project NodeJS dependencies..."
            //sh 'npm ci'
            echo "Installing the NodeJS dependencies (MongoDB migration project), executing the MongoDB migration script..."
            dir('db-migrations') {
              sh 'npm ci'
              sh 'npm run migrate -- --mongodb-url="$MONGODB_PROD_URL"'
            }
            slackSend(color: "good", channel: SLACK_THREAD, message: "Completed Migration-Prod")
          }
          catch (Exception error) {
            slackSend(color: "danger", channel: SLACK_THREAD, message: "Failed Migration-Prod with: ${error.toString()}")
            error("Stop pipeline")
          }
        }
      }
    }

    stage('E2E-Staging') {
      environment {
        ENVIRONMENT = 'staging'
      }
      when {
        anyOf {
          branch 'staging';
        }
      }
      steps {
      script {
      try {
//        timeout(time: 10, unit:'MINUTES') {
//          input 'Run E2E on Staging'
//        }
        echo "Change directory to e2e"
        dir('e2e') {
        sh 'npm install'
        sh 'npx cypress run --config baseUrl=${STAGING_URL} --env host=${STAGING_URL},environment=${ENVIRONMENT} --record --key $CYPRESS_TOKEN'
        }
        slackSend(color: "good", channel: SLACK_THREAD, message: "Completed E2E-Staging")
      }
      catch (Exception error) {
    slackSend(color: "danger", channel: SLACK_THREAD, message: "E2E-Staging failed with: ${error.toString()}")
    error("Stop pipeline")
    }
        }
      }
    }
    
     stage('Merge with production') {
      when {
        anyOf {
          branch 'staging'
          expression {
            currentBuild.result == 'SUCCESS' && isWebsiteUp()
          }
        }
      }
      steps {
        script {
          def isWebsiteUp = {
            def response = httpRequest "https://staging.blockspaces.dev/api"
            echo "Response: ${response}"
            echo "Response status: ${response.status}"
            return response.status == 200
          }
          if (isWebsiteUp()) {
            sh 'git stash'
            sh 'git status'
            sh 'git checkout production'
            sh 'git status'
            sh 'git merge origin/staging'
            sh 'git push origin production'
          } else {
            echo "Website is down, not merging with Production"
          }
        }
      }
    }
    stage('Sonarqube') {
      when {
        anyOf {
          branch 'DISABLED';
         }
      }
      steps {
      script {
      try {
        echo 'Performing the Sonarqube codecoverage scan...'
        sh '${SONAR_SCANNER_PATH}/sonar-scanner -Dsonar.projectKey=Blocspaces-Core -Dsonar.sources=. -Dsonar.host.url=${SONAR_URL} -Dsonar.login=$SONAR_TOKEN'
        slackSend(color: "good", channel: SLACK_THREAD, message: "Completed Sonarqube")  
        }
      catch (Exception error) {
    slackSend(color: "danger", channel: SLACK_THREAD, message: "Sonarqube stage failed with: ${error.toString()}")
    error("Stop pipeline")
    }
      }
      }
}
    }
   post {
     cleanup {
       echo 'Removing the workspace directory...'
       cleanWs()
       echo 'Cleaning up the docker images...'
       sh 'docker image prune -a --force --filter "until=72h"'
       sh 'docker system prune -f'
     }
   }
}
