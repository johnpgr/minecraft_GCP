# How to install Minecraft on Google Cloud Platform
* `backup.sh` -- Script that makes backups of world files and deletes backups that are 7 days or older
* `minecraft.service` -- systemd script to make minecraft a service
## Install Java
```bash
sudo apt update && sudo apt upgrade -y
sudo apt-get install -y openjdk-17-jdk
```

## Setup Server
```bash
mkdir server
cd server
curl -L -o server.jar https://meta.fabricmc.net/v2/versions/loader/1.20.1/0.15.7/1.0.0/server/jar
java -jar server.jar
```

Agree to eula

## Server config
```bash
screen java -Xms2G -Xmx4G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:InitiatingHeapOccupancyPercent=15 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true -jar server.jar nogui
To detach: control+a+d
To reattach: screen -r
```
To update `minecraft.service`
```
sudo cp minecraft.service /etc/systemd/system/minecraft.service
systemctl daemon-reload
```
To run the server manually
```
sudo su -- minecraft
```
## Auto restart
```bash
sudo useradd -r -m -d /opt/minecraft minecraft
sudo vim /etc/systemd/system/minecraft.service
sudo mv server /opt/minecraft/
sudo chown -R minecraft:minecraft /opt/minecraft/server
sudo systemctl start minecraft
sudo systemctl stop minecraft
sudo systemctl restart minecraft
sudo systemctl enable minecraft
```
## Periodic restart
```bash
sudo su
crontab -e
0 */12 * * * /bin/systemctl restart minecraft
```
## Server scripts
```bash
cp backup.sh /opt/minecraft
du -sh world/ world_nether/ world_the_end/
df -h
```
Copy files from the server
```
scp user@ip:/source file ~/destination file
```
Check systemd logs
```
journalctl -u minecraft.service --since yesterday
```
## Check size of current directory
```
du -h -s
```
## Extract .tar.gz
```
tar -xf <filename>
```