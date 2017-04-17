define([
  'components/audioComponent',
  'components/backgroundLoaderComponent',
  'components/cameraComponent',
  'components/chickenComponent',
  'components/chickenSpawnerComponent',
  'components/colliderComponent',
  'components/countdownComponent',
  'components/enablerComponent',
  'components/heartComponent',
  'components/inputComponent',
  'components/layerComponent',
  'components/lifeComponent',
  'components/playerComponent',
  'components/positionComponent',
  'components/networkingComponent',
  'components/networkInputComponent',
  'components/networkLeaderboardComponent',
  'components/networkPlayerManagerComponent',
  'components/rawSpriteComponent',
  'components/refereeComponent',
  'components/rupeeComponent',
  'components/scoreComponent',
  'components/spriteComponent',
  'components/spriteSheetComponent',
  'components/textSpriteComponent',
  'components/timerComponent',
  'components/deformationCompositorComponent',
  'components/renderCompositorComponent',
  'components/debugDrawCallsComponent',
], (
  AudioComponent,
  BackgroundLoaderComponent,
  CameraComponent,
  ChickenComponent,
  ChickenSpawnerComponent,
  ColliderComponent,
  CountdownComponent,
  EnablerComponent,
  HeartComponent,
  InputComponent,
  LayerComponent,
  LifeComponent,
  PlayerComponent,
  PositionComponent,
  NetworkingComponent,
  NetworkInputComponent,
  NetworkLeaderboardComponent,
  NetworkPlayerManagerComponent,
  RawSpriteComponent,
  RefereeComponent,
  RupeeComponent,
  ScoreComponent,
  SpriteComponent,
  SpriteSheetComponent,
  TextSpriteComponent,
  TimerComponent,
  DeformationCompositorComponent,
  RenderCompositorComponent,
  DebugDrawCallsComponent
) => {
  'use strict';

  // # Classe *ComponentFactory*
  // Cette classe est le point d'entrée pour créer les composants.
  class ComponentFactory {
    // ## Fonction statique *create*
    // Cette fonction instancie un nouveau composant choisi dans
    // le tableau `componentCreators` depuis son nom.
    static create(type, owner) {
      const comp = new ComponentFactory.componentCreators[type](owner);
      comp.__type = type;
      return comp;
    }
  }

  // ## Attribut statique *componentCreators*
  // Ce tableau associatif fait le lien entre les noms des composants
  // tels qu'utilisés dans le fichier JSON et les classes de
  // composants correspondants.
  ComponentFactory.componentCreators = {
    Audio: AudioComponent,
    BackgroundLoader: BackgroundLoaderComponent,
    Camera: CameraComponent,
    Chicken: ChickenComponent,
    ChickenSpawner: ChickenSpawnerComponent,
    Collider: ColliderComponent,
    Countdown: CountdownComponent,
    Enabler: EnablerComponent,
    Heart: HeartComponent,
    Input: InputComponent,
    Layer: LayerComponent,
    Life: LifeComponent,
    Player: PlayerComponent,
    Position: PositionComponent,
    Networking: NetworkingComponent,
    NetworkInput: NetworkInputComponent,
    NetworkLeaderboard: NetworkLeaderboardComponent,
    NetworkPlayerManager: NetworkPlayerManagerComponent,
    RawSprite: RawSpriteComponent,
    Referee: RefereeComponent,
    Rupee: RupeeComponent,
    Score: ScoreComponent,
    Sprite: SpriteComponent,
    SpriteSheet: SpriteSheetComponent,
    TextSprite: TextSpriteComponent,
    Timer: TimerComponent,
    DeformationCompositor: DeformationCompositorComponent,
    RenderCompositor: RenderCompositorComponent,
    DebugDrawCalls: DebugDrawCallsComponent,
  };

  return ComponentFactory;
});
