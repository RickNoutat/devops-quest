/**
 * Données Partie 1 — Environnement CI/CD avec Jenkins
 *
 * Structure :
 * - instructions[] : actions manuelles (cases à cocher) — liens, clics dans une UI
 *   → { text, links?: [{ label, url }] }
 * - commands[]     : commandes CLI (blocs copiables)
 *   → { cmd, note, os?: { windows, mac, linux } }  (os optionnel si multi-plateforme)
 */
module.exports = {
  id: "part1",
  title: "Environnement CI/CD avec Jenkins",
  description: "Pipeline CI/CD complet avec Jenkins, Docker, agents JNLP, ngrok et webhooks GitHub",
  icon: "🔧",
  color: "#7c7cff",
  totalXP: 1080,
  steps: [
    {
      id: "1-1", number: 1, title: "Installer un hyperviseur & créer la VM Ubuntu",
      description: "Installer un logiciel de virtualisation et créer une VM Ubuntu 24.04.",
      xp: 50, difficulty: "easy", estimatedTime: "15 min",
      instructions: [
        { text: "Télécharger un hyperviseur :", links: [
          { label: "VMWare Fusion (macOS)", url: "https://www.vmware.com/products/fusion.html" },
          { label: "VMWare Workstation (Windows)", url: "https://www.vmware.com/products/workstation-pro.html" },
          { label: "UTM (macOS Apple Silicon — recommandé M1/M2/M3)", url: "https://mac.getutm.app/" },
          { label: "VirtualBox (Windows / Linux / macOS Intel)", url: "https://www.virtualbox.org/wiki/Downloads" },
        ]},
        { text: "Télécharger l'ISO Ubuntu 24.04 LTS :", links: [
          { label: "Ubuntu Desktop (amd64)", url: "https://ubuntu.com/download/desktop" },
          { label: "Ubuntu Server ARM64 (pour UTM/Apple Silicon)", url: "https://ubuntu.com/download/server/arm" },
        ]},
        { text: "Créer une VM : RAM 4 Go, Disque 40 Go, 2 CPU" },
        { text: "Installer Ubuntu et créer un compte utilisateur" },
        { text: "Prendre un snapshot 'VM Vierge' après l'installation" },
      ],
      commands: [],
      validation: "La VM démarre et tu peux te connecter",
      tips: [
        "Mac Apple Silicon (M1/M2/M3) → UTM ou VMWare Fusion. VM en ARM64 (aarch64)",
        "Windows / Linux / Mac Intel → VirtualBox ou VMWare. VM en AMD64 (x86_64)",
      ],
      traps: [],
    },
    {
      id: "1-2", number: 2, title: "Vérifier la connectivité réseau",
      description: "Vérifier que la VM accède à Internet et communique avec la machine hôte.",
      xp: 30, difficulty: "easy", estimatedTime: "5 min",
      instructions: [],
      commands: [
        { cmd: "ip addr show", note: "Repérer l'adresse IP de la VM" },
        { cmd: "ping -c 3 google.com", note: "Tester l'accès Internet" },
        { cmd: "ping -c 3 192.168.64.1", note: "Tester la communication avec l'hôte (adapter l'IP)" },
      ],
      validation: "Les 3 pings répondent sans perte de paquets",
      tips: ["Si pas de réseau → vérifier le mode réseau de l'hyperviseur (NAT ou Bridged)"],
      traps: [],
    },
    {
      id: "1-3", number: 3, title: "Installer Docker Engine",
      description: "Installer Docker Engine (pas Docker Desktop) directement sur Ubuntu.",
      xp: 100, difficulty: "medium", estimatedTime: "10 min",
      instructions: [],
      commands: [
        { cmd: "sudo apt update && sudo apt install -y ca-certificates curl gnupg", note: "Prérequis" },
        { cmd: "sudo install -m 0755 -d /etc/apt/keyrings\ncurl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg\nsudo chmod a+r /etc/apt/keyrings/docker.gpg", note: "Clé GPG Docker" },
        { cmd: 'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \\"$VERSION_CODENAME\\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null', note: "Ajouter le repo Docker" },
        { cmd: "sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin", note: "Installer Docker Engine" },
        { cmd: "sudo usermod -aG docker $USER && newgrp docker", note: "Permissions (évite sudo)" },
        { cmd: "docker --version", note: "✅ Vérifier" },
      ],
      validation: "docker --version affiche la version",
      tips: ["uname -m pour connaître ton architecture (amd64 ou arm64)"],
      traps: ["Sur ARM64 (Apple Silicon) certaines images Docker ne sont pas disponibles nativement — ajouter --platform linux/amd64 si nécessaire"],
    },
    {
      id: "1-4", number: 4, title: "Créer le réseau Docker 'devops'",
      description: "Réseau dédié pour la communication entre conteneurs Jenkins.",
      xp: 30, difficulty: "easy", estimatedTime: "2 min",
      instructions: [],
      commands: [
        { cmd: "docker network create devops", note: "Créer le réseau bridge" },
        { cmd: "docker network ls", note: "Vérifier" },
      ],
      validation: "'devops' apparaît dans la liste",
      tips: ["Réseau personnalisé = conteneurs communiquent par nom (http://jenkins:8080)"],
      traps: [],
    },
    {
      id: "1-5", number: 5, title: "Déployer Jenkins Master",
      description: "Lancer Jenkins dans Docker. Port 8080 = web, port 50000 = agents.",
      xp: 150, difficulty: "medium", estimatedTime: "15 min",
      instructions: [
        { text: "Ouvrir http://<IP_VM>:8080 dans le navigateur" },
        { text: "Coller le mot de passe initial récupéré avec docker logs" },
        { text: "Cliquer 'Install suggested plugins'" },
        { text: "Créer un compte administrateur" },
      ],
      commands: [
        { cmd: "docker run -d \\\n  --name jenkins \\\n  --network devops \\\n  -p 8080:8080 \\\n  -p 50000:50000 \\\n  -v jenkins_home:/var/jenkins_home \\\n  jenkins/jenkins:lts", note: "Lancer Jenkins avec persistance" },
        { cmd: "docker logs jenkins", note: "Récupérer le mot de passe initial (entre les ****)" },
      ],
      validation: "Jenkins accessible sur :8080, compte admin créé",
      tips: ["Le volume jenkins_home persiste même si le conteneur est supprimé"],
      traps: ["Mot de passe oublié → docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"],
    },
    {
      id: "1-6", number: 6, title: "Pipeline hello-world",
      description: "Premier pipeline pour valider le bon fonctionnement.",
      xp: 50, difficulty: "easy", estimatedTime: "5 min",
      instructions: [
        { text: "Jenkins → New Item → Nom : 'hello-world' → Type : Pipeline → OK" },
        { text: "Coller le script ci-dessous dans 'Pipeline Script'" },
        { text: "Save → Build Now" },
      ],
      commands: [
        { cmd: "pipeline {\n  agent any\n  stages {\n    stage('Hello') {\n      steps {\n        echo 'Hello World!'\n      }\n    }\n  }\n}", note: "Script Pipeline à coller dans Jenkins" },
      ],
      validation: "Build #1 vert ✅ avec 'Hello World!' dans la console",
      tips: [], traps: [],
    },
    {
      id: "1-7", number: 7, title: "Pipeline CI complète (4 stages)",
      description: "Jenkinsfile versionné dans GitHub avec 4 stages : Checkout → Build → Test → Deploy.",
      xp: 150, difficulty: "medium", estimatedTime: "15 min",
      instructions: [
        { text: "Créer un repo GitHub avec un fichier index.html" },
        { text: "Ajouter un fichier 'Jenkinsfile' à la racine du repo (contenu ci-dessous)" },
        { text: "Jenkins → New Item → 'pipeline-ci' → Pipeline" },
        { text: "Pipeline → 'Pipeline script from SCM' → Git → URL du repo → Branch: */main → Script Path: Jenkinsfile" },
        { text: "Build Now" },
      ],
      commands: [
        { cmd: "pipeline {\n  agent any\n  stages {\n    stage('Checkout') {\n      steps {\n        echo 'Récupération du code...'\n        checkout scm\n      }\n    }\n    stage('Build') {\n      steps { echo 'Compilation...' }\n    }\n    stage('Test') {\n      steps { echo 'Tests...' }\n    }\n    stage('Deploy') {\n      steps { echo 'Déploiement...' }\n    }\n  }\n}", note: "Jenkinsfile à commiter dans le repo" },
      ],
      validation: "4 stages verts dans Jenkins",
      tips: ["Pipeline script from SCM = Jenkins cherche le Jenkinsfile dans le repo"],
      traps: [],
    },
    {
      id: "1-8", number: 8, title: "Configurer l'agent Jenkins (JNLP)",
      description: "Le master orchestre, l'agent exécute les builds.",
      xp: 200, difficulty: "hard", estimatedTime: "20 min",
      instructions: [
        { text: "Jenkins → Manage Jenkins → Nodes → New Node" },
        { text: "Nom : agent-1 | Executors : 2 | Label : agent-1" },
        { text: "Launch method : 'Launch agent by connecting it to the controller'" },
        { text: "Sauvegarder → cliquer sur agent-1 → copier le secret JNLP affiché" },
        { text: "Modifier le Jenkinsfile sur GitHub : remplacer 'agent any' par 'agent { label \"agent-1\" }'" },
      ],
      commands: [
        { cmd: "docker run -d \\\n  --name jenkins-agent \\\n  --network devops \\\n  -e JENKINS_URL=http://jenkins:8080 \\\n  -e JENKINS_AGENT_NAME=agent-1 \\\n  -e JENKINS_SECRET=<SECRET_JNLP> \\\n  -e JENKINS_AGENT_WORKDIR=/home/jenkins/agent \\\n  jenkins/inbound-agent", note: "⚠️ Remplacer <SECRET_JNLP> par le vrai secret copié" },
      ],
      validation: "Console Output : 'Running on agent-1'",
      tips: ["L'agent communique via le port 50000 (JNLP)"],
      traps: ["Le secret change si tu recrées le node dans Jenkins"],
    },
    {
      id: "1-9", number: 9, title: "Configurer le tunnel ngrok",
      description: "Exposer Jenkins sur Internet pour les webhooks GitHub.",
      xp: 100, difficulty: "medium", estimatedTime: "10 min",
      instructions: [
        { text: "Créer un compte gratuit sur ngrok et copier le auth token", links: [
          { label: "dashboard.ngrok.com", url: "https://dashboard.ngrok.com/signup" },
        ]},
      ],
      commands: [
        { cmd: "sudo snap install ngrok", note: "Installer ngrok (dans la VM Ubuntu)", os: {
          windows: "choco install ngrok",
          mac: "brew install ngrok",
          linux: "sudo snap install ngrok",
        }},
        { cmd: "ngrok config add-authtoken <TON_TOKEN>", note: "Ton token depuis le dashboard ngrok" },
        { cmd: "ngrok http 8080", note: "Lancer le tunnel — l'URL publique s'affiche" },
      ],
      validation: "L'URL publique ngrok affiche Jenkins",
      tips: ["URL change à chaque redémarrage (plan gratuit)", "http://127.0.0.1:4040 = dashboard de debug ngrok"],
      traps: ["Plan gratuit : page de confirmation bloque les webhooks (erreur 502). Les builds manuels fonctionnent."],
    },
    {
      id: "1-10", number: 10, title: "Configurer le webhook GitHub",
      description: "Un git push déclenche automatiquement un build Jenkins.",
      xp: 150, difficulty: "medium", estimatedTime: "10 min",
      instructions: [
        { text: "Jenkins → pipeline-ci → Configure → Build Triggers → Cocher 'GitHub hook trigger for GITScm polling'" },
        { text: "GitHub → Repo → Settings → Webhooks → Add webhook" },
        { text: "Payload URL : https://<URL_NGROK>/github-webhook/ (⚠️ avec le / à la fin !)" },
        { text: "Content type : application/json" },
        { text: "Events : 'Just the push event' → Add webhook" },
      ],
      commands: [],
      validation: "Push sur GitHub → build auto. Console: 'Started by GitHub push'",
      tips: ["Recent Deliveries montre si le webhook a réussi (200) ou échoué"],
      traps: ["Pas de / final = Jenkins ignore la requête", "ngrok redémarré = URL changée → mettre à jour le webhook"],
    },
  ],
};
