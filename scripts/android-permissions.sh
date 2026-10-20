#!/usr/bin/env bash
# Ajoute les permissions caméra / micro au projet Android généré par Capacitor
set -e
M=android/app/src/main/AndroidManifest.xml
for P in CAMERA RECORD_AUDIO MODIFY_AUDIO_SETTINGS; do
  grep -q "android.permission.$P" "$M" || sed -i "s#<application#<uses-permission android:name=\"android.permission.$P\" />\n    <application#" "$M"
done
grep -q 'android.hardware.camera' "$M" || sed -i 's#<application#<uses-feature android:name="android.hardware.camera" android:required="false" />\n    <application#' "$M"
# Autoriser getUserMedia dans la WebView (accorde la caméra demandée par la page)
MA=$(find android/app/src/main/java -name MainActivity.java | head -1)
cat > "$MA" <<'JAVA'
package bj.rsuta.app;

import android.Manifest;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    ActivityCompat.requestPermissions(this, new String[]{ Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO }, 1);
    bridge.getWebView().setWebChromeClient(new BridgeWebChromeClient(bridge) {
      @Override
      public void onPermissionRequest(final PermissionRequest request) {
        runOnUiThread(() -> request.grant(request.getResources()));
      }
    });
  }
}
JAVA
echo "Permissions Android configurées."
