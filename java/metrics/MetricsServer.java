import java.io.*;
import java.net.*;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * MetricsServer — receives and logs metrics from Python nodes.
 * Python nodes send JSON metric strings to port 9090.
 * Compile: javac MetricsServer.java
 * Run:     java MetricsServer
 */
public class MetricsServer {

    private static final int PORT = 9090;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final ExecutorService pool = Executors.newCachedThreadPool();

    public static void main(String[] args) throws Exception {
        ServerSocket server = new ServerSocket(PORT);
        System.out.println("[MetricsServer] Listening on port " + PORT);

        while (true) {
            Socket client = server.accept();
            pool.submit(() -> handle(client));
        }
    }

    private static void handle(Socket client) {
        try (BufferedReader in = new BufferedReader(
                new InputStreamReader(client.getInputStream()))) {

            String line;
            while ((line = in.readLine()) != null && !line.isEmpty()) {
                String ts = LocalTime.now().format(FMT);
                System.out.printf("[%s][METRIC] %s%n", ts, line);
            }
        } catch (Exception e) {
            System.err.println("[MetricsServer] Error: " + e.getMessage());
        } finally {
            try { client.close(); } catch (Exception ignored) {}
        }
    }
}
