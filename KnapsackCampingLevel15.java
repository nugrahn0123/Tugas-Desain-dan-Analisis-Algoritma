import java.util.*;

public class KnapsackCampingLevel15 {

    public static void main(String[] args) {

        int W = 15; // kapasitas maksimum (kg)

        // Data barang camping
        String[] nama = {
                "Tenda Camping",
                "Sleeping Bag",
                "Pakaian Hangat",
                "Obat Pribadi",
                "Senter",
                "Botol Air",
                "Kompor Portable",
                "Peralatan Makan",
                "Pisau Lipat",
                "Jas Hujan",
                "Makanan",
                "Peralatan Masak",
                "Matras",
                "Alat Kebersihan",
                "Hammock"
        };

        int[] berat = {4, 2, 3, 1, 1, 1, 2, 1, 1, 2, 3, 2, 3, 2, 2};
        int[] nilai = {90, 80, 89, 70, 60, 85, 80, 70, 40, 35, 80, 75, 79, 30, 20};

        int n = berat.length;

        int[][] dp = new int[n + 1][W + 1];

        // Proses Dynamic Programming
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= W; w++) {
                if (berat[i - 1] <= w) {
                    dp[i][w] = Math.max(
                            dp[i - 1][w],
                            dp[i - 1][w - berat[i - 1]] + nilai[i - 1]
                    );
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }

        int maxNilai = dp[n][W];
        System.out.println("=================================");
        System.out.println("NILAI MAKSIMUM : " + maxNilai);

        int w = W;
        int totalBerat = 0;
        List<Integer> itemTerpilih = new ArrayList<>();

        // Backtracking DP Table
        for (int i = n; i > 0 && maxNilai > 0; i--) {
            if (maxNilai != dp[i - 1][w]) {
                itemTerpilih.add(i - 1);
                maxNilai -= nilai[i - 1];
                w -= berat[i - 1];
                totalBerat += berat[i - 1];
            }
        }

        Collections.reverse(itemTerpilih);

        System.out.println("TOTAL BERAT   : " + totalBerat + " kg");
        System.out.println("\nITEM TERPILIH :");

        for (int i : itemTerpilih) {
            System.out.println("- " + nama[i] +
                    " (Berat: " + berat[i] + " kg, Nilai: " + nilai[i] + ")");
        }

        System.out.println("=================================");
    }
}
