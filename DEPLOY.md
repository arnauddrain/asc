# To deploy to ionic view:
```$> ionic upload```

# To deploy on the Play Store:
- Upate version in config.xml
```$> ionic cordova build --aot --release --prod android```
```$> jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk alias_name```
```$> cd platforms/android/app/build/outputs/apk/release```
```$> rm app-release.apk```
- Find your zipalign path
```$> [zipalignpath] -v 4 app-release-unsigned.apk app-release.apk```
- Go to https://play.google.com/apps/publish/
- Go to Gestion de la publication > Versions de l'application > Gérer la production > Créer une version

# To deploy on the Apple Store:
- TODO