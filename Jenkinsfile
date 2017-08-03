def loadUtils() {
    return fileLoader.fromGit('Jenkinsfile', 'https://github.com/containership/containership.cloud.jenkins-pipeline.git', 'master', 'containershipbot_github_user_pass', '')
}

def utils

node {
    stage('Preparation') {
        utils = loadUtils()
    }
}

utils.runTestingPipeline()
