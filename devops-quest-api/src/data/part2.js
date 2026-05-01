/**
 * Données Partie 2 — Déploiement sur Azure
 */
module.exports = {
  id: "part2",
  title: "Déploiement sur Azure",
  description: "Déployer landing page + API Node.js sur une VM Azure avec Jenkins, Docker et DockerHub",
  icon: "☁️",
  color: "#00ffd5",
  totalXP: 1440,
  steps: [
    {
      id: "2-1", number: 1, title: "Créer un compte Azure for Student",
      description: "Microsoft offre 100$ de crédits cloud aux étudiants.",
      xp: 30, difficulty: "easy", estimatedTime: "10 min",
      instructions: [
        { text: "Créer un compte Azure avec ton adresse universitaire", links: [
          { label: "portal.azure.com", url: "https://portal.azure.com" },
        ]},
        { text: "Activer l'offre 'Azure for Students' (100$ gratuits, pas de CB)" },
      ],
      commands: [],
      validation: "Abonnement Azure for Students actif dans le portail",
      tips: [], traps: [],
    },
    {
      id: "2-2", number: 2, title: "Installer Azure CLI & créer la VM",
      description: "Provisionner une VM Ubuntu sur Azure. ⚠️ Restrictions de régions et de SKU.",
      xp: 200, difficulty: "hard", estimatedTime: "30 min",
      instructions: [
        { text: "Installer Azure CLI :", links: [
          { label: "Documentation installation Azure CLI", url: "https://learn.microsoft.com/fr-fr/cli/azure/install-azure-cli" },
        ]},
      ],
      commands: [
        { cmd: "brew install azure-cli", note: "Installer Azure CLI", os: {
          windows: "winget install -e --id Microsoft.AzureCLI",
          mac: "brew install azure-cli",
          linux: "curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash",
        }},
        { cmd: "az login", note: "Se connecter (ouvre le navigateur)" },
        { cmd: 'az policy assignment list --query "[].{name:name, params:parameters}" -o json', note: "⚠️ Vérifier les régions autorisées par ton abonnement" },
        { cmd: "az vm list-skus --location <REGION> --size Standard_B \\\n  --query \"[?restrictions[0].reasonCode!='NotAvailableForSubscription'].name\" -o tsv", note: "Trouver un SKU (taille de VM) disponible" },
        { cmd: "az group create --name rg-devops --location <REGION>", note: "Créer le groupe de ressources" },
        { cmd: "az vm create \\\n  --resource-group rg-devops \\\n  --name vm-devops \\\n  --image Ubuntu2404 \\\n  --size Standard_B2ats_v2 \\\n  --admin-username <TON_USER> \\\n  --generate-ssh-keys \\\n  --public-ip-sku Standard \\\n  --location <REGION>", note: "📝 NOTER L'IP PUBLIQUE dans le résultat JSON" },
      ],
      validation: "IP publique dans le résultat de az vm create",
      tips: ["Noter l'IP publique immédiatement — utilisée dans toute la suite"],
      traps: [
        "Azure for Students : régions limitées (francecentral, polandcentral, swedencentral...)",
        "Standard_B1s souvent indisponible → Standard_B2ats_v2",
      ],
    },
    {
      id: "2-3", number: 3, title: "Ouvrir les ports & SSH",
      description: "Ouvrir les ports 80 (web) et 3000 (API), puis se connecter.",
      xp: 50, difficulty: "easy", estimatedTime: "5 min",
      instructions: [],
      commands: [
        { cmd: "az vm open-port --resource-group rg-devops --name vm-devops --port 80", note: "Port landing page" },
        { cmd: "az vm open-port --resource-group rg-devops --name vm-devops --port 3000 --priority 1010", note: "Port API" },
        { cmd: "ssh <TON_USER>@<IP_PUBLIQUE>", note: "Se connecter à la VM Azure" },
      ],
      validation: "Connexion SSH réussie (le prompt change)",
      tips: [], traps: [],
    },
    {
      id: "2-4", number: 4, title: "Installer Docker sur la VM Azure",
      description: "Même procédure que l'étape 1-3, mais sur la VM Azure (production).",
      xp: 80, difficulty: "medium", estimatedTime: "10 min",
      instructions: [
        { text: "Se connecter en SSH à la VM Azure" },
        { text: "Exécuter les mêmes commandes que l'étape 1-3 (installation Docker Engine)" },
      ],
      commands: [
        { cmd: "docker --version", note: "✅ Vérifier après installation" },
      ],
      validation: "Docker fonctionne sur la VM Azure",
      tips: ["La VM Azure est en AMD64 (x86_64) — pas de souci de compatibilité d'images"],
      traps: [],
    },
    {
      id: "2-5", number: 5, title: "Image Docker de la landing page",
      description: "Conteneuriser la landing page avec nginx.",
      xp: 100, difficulty: "medium", estimatedTime: "10 min",
      instructions: [],
      commands: [
        { cmd: "git clone https://github.com/<TON_USER>/landing-page.git\ncd landing-page", note: "Cloner le repo sur la VM Azure" },
        { cmd: "cat > Dockerfile << 'EOF'\nFROM nginx:alpine\nCOPY index.html /usr/share/nginx/html/index.html\nEXPOSE 80\nEOF", note: "Créer le Dockerfile" },
        { cmd: "docker build -t landing-page .", note: "Builder l'image" },
        { cmd: "docker run -d --name landing -p 80:80 landing-page", note: "Lancer" },
        { cmd: "curl http://localhost", note: "✅ Vérifier" },
      ],
      validation: "Page accessible sur http://<IP_PUBLIQUE> dans le navigateur",
      tips: [],
      traps: ["Le fichier doit s'appeler exactement 'Dockerfile' (D majuscule)"],
    },
    {
      id: "2-6", number: 6, title: "Publier sur DockerHub",
      description: "Pousser l'image pour la rendre disponible à Jenkins.",
      xp: 80, difficulty: "medium", estimatedTime: "5 min",
      instructions: [
        { text: "Créer un compte DockerHub si nécessaire", links: [
          { label: "hub.docker.com", url: "https://hub.docker.com/signup" },
        ]},
      ],
      commands: [
        { cmd: "docker login", note: "Se connecter à DockerHub" },
        { cmd: "docker info | grep Username", note: "⚠️ Vérifier ton username exact" },
        { cmd: "docker tag landing-page <USERNAME>/landing-page:latest", note: "Tagger avec ton username" },
        { cmd: "docker push <USERNAME>/landing-page:latest", note: "Pousser l'image" },
      ],
      validation: "Image visible sur hub.docker.com",
      tips: ["Toujours vérifier le username avec docker info avant de tagger"],
      traps: ["'push access denied' = le tag ne correspond pas au username DockerHub"],
    },
    {
      id: "2-7", number: 7, title: "SSH entre Jenkins et Azure",
      description: "L'agent Jenkins doit se connecter en SSH à la VM Azure sans mot de passe.",
      xp: 200, difficulty: "hard", estimatedTime: "20 min",
      instructions: [],
      commands: [
        { cmd: 'ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""', note: "Générer la clé SSH (sur la VM locale)" },
        { cmd: "cat ~/.ssh/id_rsa.pub", note: "Afficher et copier la clé publique" },
        { cmd: 'az vm user update \\\n  --resource-group rg-devops \\\n  --name vm-devops \\\n  --username <TON_USER> \\\n  --ssh-key-value "<CLE_PUBLIQUE>"', note: "Ajouter la clé à Azure (depuis la machine hôte, pas la VM)" },
        { cmd: "ssh <TON_USER>@<IP_PUBLIQUE>", note: "Tester — doit se connecter sans mot de passe" },
        { cmd: "docker exec jenkins-agent mkdir -p /home/jenkins/.ssh\ndocker cp ~/.ssh/id_rsa jenkins-agent:/home/jenkins/.ssh/id_rsa\ndocker exec jenkins-agent chown -R 1000:1000 /home/jenkins/.ssh\ndocker exec jenkins-agent chmod 600 /home/jenkins/.ssh/id_rsa", note: "Copier la clé dans l'agent Jenkins (⚠️ jenkins-agent, PAS jenkins)" },
      ],
      validation: "L'agent Jenkins se connecte en SSH à Azure sans mot de passe",
      tips: [],
      traps: [
        "ssh-copy-id ne fonctionne PAS si Azure n'accepte que l'auth par clé",
        "La clé doit être dans jenkins-agent (l'agent) PAS dans jenkins (le master)",
      ],
    },
    {
      id: "2-8", number: 8, title: "Docker dans l'agent Jenkins",
      description: "Monter le socket Docker pour que l'agent puisse builder des images.",
      xp: 150, difficulty: "hard", estimatedTime: "15 min",
      instructions: [],
      commands: [
        { cmd: "docker stop jenkins-agent && docker rm jenkins-agent", note: "Supprimer l'ancien agent" },
        { cmd: "docker run -d \\\n  --name jenkins-agent \\\n  --network devops \\\n  -v /var/run/docker.sock:/var/run/docker.sock \\\n  -v /usr/bin/docker:/usr/bin/docker \\\n  -e JENKINS_URL=http://jenkins:8080 \\\n  -e JENKINS_AGENT_NAME=agent-1 \\\n  -e JENKINS_SECRET=<SECRET> \\\n  -e JENKINS_AGENT_WORKDIR=/home/jenkins/agent \\\n  jenkins/inbound-agent", note: "Recréer avec les volumes Docker" },
        { cmd: "docker exec -u root jenkins-agent chmod 666 /var/run/docker.sock", note: "Permissions sur le socket" },
        { cmd: "docker exec -it jenkins-agent docker login -u <DOCKERHUB_USER>", note: "Login DockerHub dans l'agent" },
        { cmd: "docker exec jenkins-agent mkdir -p /home/jenkins/.ssh\ndocker cp ~/.ssh/id_rsa jenkins-agent:/home/jenkins/.ssh/id_rsa\ndocker exec jenkins-agent chown -R 1000:1000 /home/jenkins/.ssh\ndocker exec jenkins-agent chmod 600 /home/jenkins/.ssh/id_rsa", note: "⚠️ Remettre la clé SSH (perdue lors de la recréation)" },
      ],
      validation: "docker exec jenkins-agent docker --version fonctionne",
      tips: ["Après chaque recréation → remettre : clé SSH + login DockerHub"],
      traps: ["'executable not found: docker' = socket non monté", "'permission denied' = chmod 666"],
    },
    {
      id: "2-9", number: 9, title: "Pipeline Build → Push → Deploy",
      description: "Jenkinsfile complet : build, push DockerHub, deploy via SSH sur Azure.",
      xp: 250, difficulty: "hard", estimatedTime: "15 min",
      instructions: [
        { text: "Remplacer les variables (<USER>, <IP>, <DOCKERHUB>) par tes vraies valeurs" },
        { text: "Commiter ce Jenkinsfile dans le repo GitHub de la landing page" },
        { text: "Lancer le build dans Jenkins" },
      ],
      commands: [
        { cmd: "pipeline {\n  agent { label 'agent-1' }\n  environment {\n    AZURE_VM = '<USER>@<IP_AZURE>'\n    IMAGE = '<DOCKERHUB_USER>/landing-page'\n  }\n  stages {\n    stage('Checkout') { steps { checkout scm } }\n    stage('Build Image') {\n      steps { sh 'docker build -t ${IMAGE}:latest .' }\n    }\n    stage('Push Image') {\n      steps { sh 'docker push ${IMAGE}:latest' }\n    }\n    stage('Deploy') {\n      steps {\n        sh \"\"\"\n          ssh -o StrictHostKeyChecking=no ${AZURE_VM} '\n            docker pull ${IMAGE}:latest &&\n            docker stop landing || true &&\n            docker rm landing || true &&\n            docker run -d --name landing -p 80:80 ${IMAGE}:latest\n          '\n        \"\"\"\n      }\n    }\n  }\n}", note: "Jenkinsfile complet" },
      ],
      validation: "Build SUCCESS + landing page live sur http://<IP_AZURE>",
      tips: [],
      traps: [
        "⚠️ Images ARM64 (Mac) NE FONCTIONNENT PAS sur Azure (AMD64) — conteneurs crashent. Rebuilder sur Azure.",
        "Le Dockerfile doit être dans le repo GitHub",
      ],
    },
    {
      id: "2-10", number: 10, title: "Déployer l'API Node.js",
      description: "Reproduire les mêmes étapes pour l'API Express du prof.",
      xp: 200, difficulty: "hard", estimatedTime: "20 min",
      instructions: [
        { text: "Forker le repo du prof", links: [
          { label: "github.com/fredericEducentre/simple_api", url: "https://github.com/fredericEducentre/simple_api" },
        ]},
        { text: "Ajouter un Dockerfile au repo forké (contenu ci-dessous)" },
        { text: "Ajouter un Jenkinsfile identique à l'étape 2-9 (changer IMAGE et port 3000)" },
        { text: "Jenkins → New Item → 'pipeline-api' → Pipeline script from SCM → URL du fork" },
        { text: "Lancer le build" },
      ],
      commands: [
        { cmd: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]', note: "Dockerfile pour l'API" },
        { cmd: "az vm open-port --resource-group rg-devops --name vm-devops --port 3000 --priority 1010", note: "Ouvrir le port 3000 (si pas déjà fait)" },
      ],
      validation: 'http://<IP>:3000/to_uppercase/hello → {"original":"hello","uppercased":"HELLO"}',
      tips: ["/to_uppercase/:text marche sans MySQL", "/clients nécessite MySQL (optionnel)"],
      traps: [],
    },
  ],
};
