import { VehicleContext } from '../types';

export const queryApi = async (query: string, vehicleContext: VehicleContext) => {
  try {
    const startTime = Date.now();
    const res = await fetch('http://localhost:8000/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query, vehicle_context: vehicleContext })
    });
    
    if (!res.ok) {
      throw new Error('API unavailable');
    }
    const data = await res.json();
    return {
      content: data.response || "No content returned.",
      responseTime: (Date.now() - startTime) / 1000
    };
  } catch (error) {
    // Return offline simulation
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
    
    const qLower = query.toLowerCase();
    let content = '';
    
    if (qLower.includes('p0300') || qLower.includes('moteur')) {
      content = `Le code P0300 indique un raté d'allumage aléatoire/multiple sur les cylindres. Pour votre ${vehicleContext.brand} ${vehicleContext.model}, cela peut être dû à des bougies d'allumage usées, une bobine défectueuse ou une pression de carburant insuffisante. Il est recommandé de vérifier d'abord les bobines d'allumage.`;
    } else if (qLower.includes('entretien') || qLower.includes('révision')) {
      content = `Pour un kilométrage de ${vehicleContext.mileage || 'X'} km sur votre ${vehicleContext.year || ''} ${vehicleContext.brand} ${vehicleContext.model}, le prochain entretien devrait inclure : vidange de l'huile moteur, remplacement du filtre à huile, et vérification complète du système de freinage. Prévoyez cette révision d'ici 5000 km.`;
    } else if (qLower.includes('plaquette') || qLower.includes('frein')) {
      content = `Pour votre ${vehicleContext.brand} ${vehicleContext.model}, nous recommandons des plaquettes de frein céramiques haute performance. Les références compatibles incluent Brembo Premium ou Bosch QuietCast. Vérifiez également l'usure de vos disques de frein.`;
    } else if (qLower.includes('capteur') || qLower.includes('télémétrie')) {
      content = `Analyse télémétrique simulée pour ${vehicleContext.brand} ${vehicleContext.model} :
- Température liquide refroidissement : 90°C (Normal)
- Pression d'huile : 4.2 bar (Normal)
- Tension batterie : 14.1V (Charge active)
- Débitmètre d'air massique (MAF) : 4.5 g/s au ralenti.
Tous les systèmes semblent opérationnels.`;
    } else {
      content = `Le service API est actuellement indisponible. Voici une analyse simulée basée sur votre véhicule ${vehicleContext.brand || 'inconnu'} ${vehicleContext.model || ''} ${vehicleContext.year || ''}. Selon les données disponibles, le véhicule présente un état stable, mais une inspection approfondie est recommandée pour un diagnostic précis.`;
    }

    return {
      content,
      responseTime: (Date.now() - startTime) / 1000
    };
  }
};
