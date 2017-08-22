To deploy to ionic view:
$> ionic upload

To deploy on the Play Store:
-Upate version in config.xml
$> ionic cordova build --aot --release android
$> jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name
$> cd platforms/android/build/outputs/apk
$> rm android-release.apk
$> /usr/local/Cellar/android-sdk/24.4.1_1/build-tools/23.0.3/zipalign -v 4 android-release-unsigned.apk android-release.apk
-Go to https://play.google.com/apps/publish/
-Go to Gestion de la publication > Versions de l'application > Gérer la production > Créer une version

To deploy on the Apple Store:
-