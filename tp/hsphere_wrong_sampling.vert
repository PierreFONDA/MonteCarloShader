
vec3 sample_hemisphere()
{
    float Z = random_float();
    float beta = acos(Z); // Angle par rapport au plan xy

    float alpha = random_float() * 2.0 * PI; // Angle azimutal

    // Conversion de coordonnées polaires à cartésiennes
    float x = sin(alpha) * sin(beta);
    float z = cos(beta);
    float y = cos(alpha) * sin(beta);

    return normalize(vec3(x, y, z));
}

// D direction principale de l'hemisphere, normalisée
vec3 random_ray(in vec3 Incident,in vec3 D,in float Rugosite )
{
    vec3 DirR=reflect(Incident,D);
    // Choisir un vecteur W non colinéaire à D
    vec3 W = normalize(cross(D, vec3(1.0, 0.0, 1.0)));
    if (length(W) < 0.001) {
        W = normalize(cross(D, vec3(0.0, 1.0, 0.0)));
    }

    // Calculer U orthogonal à D et W
    vec3 U = normalize(cross(D, W));

    // Calculer V tel que U, V, D forment un repère orthonormé direct
    vec3 V = cross(D, U);

    // Mettre U, V, D dans une matrice de changement de repère
    mat3 M = mat3(U, D, V);

    // Multiplier votre échantillon par M pour bien l'orienter
    return M * mix(sample_hemisphere(),DirR,Rugosite);
}

void main()
{
    // Paramètre de srand : le nombre d'appels à random_float dans le shader
    srand(3u);
    float matRugosite=0.5; //si la rugosité augmente on se raproche du random
    vec3 I=normalize(normal);// a définir
    // Obtenez un rayon échantillonné aléatoirement et orienté par rapport à la normale
    vec3 P = random_ray(I,normalize(normal),matRugosite);

    // Appliquez votre matrice de projection-vue au point résultant
    gl_Position = pvMatrix * vec4(P, 1.0);
}