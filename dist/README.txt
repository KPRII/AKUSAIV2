La Résistance - Log Viewer
=========================

Installation :
-------------
1. Créez un dossier où vous voulez installer l'application
2. Copiez le fichier log_viewer.exe dans ce dossier
3. Créez un dossier nommé "logs" à côté de log_viewer.exe
4. Placez vos fichiers de logs (.log) dans le dossier "logs"

Utilisation :
------------
1. Double-cliquez sur log_viewer.exe pour lancer l'application
2. Sélectionnez une date dans la liste déroulante pour voir les logs
3. Les nouveaux messages s'affichent automatiquement

Fonctionnalités :
---------------
- Affichage en temps réel des nouveaux messages
- Case à cocher "Défilement automatique" pour suivre les nouveaux messages
- Bouton "Effacer" pour vider la liste des messages
- Bouton "Exporter en JSON" pour sauvegarder les logs au format JSON

Structure des fichiers :
---------------------
MonDossier/
  ├── log_viewer.exe
  └── logs/
      ├── 2025-04-10.log
      └── [autres fichiers .log]

Note : Les fichiers de logs doivent être au format :
[HH:MM:SS] [TYPE] utilisateur dans #salon: message
