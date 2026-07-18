<script lang="ts">
  import type { Profile, Statistics } from "$lib/types";

  let {
    profile,
    statistics,
    accountId,
  }: { profile: Profile; statistics: Statistics; accountId: string } = $props();
</script>

<div class="profile">
  {#if profile.avatarfull}
    <img class="profile__avatar" src={profile.avatarfull} alt="" />
  {:else}
    <div class="profile__avatar skeleton"></div>
  {/if}

  <div class="profile__body">
    <div class="profile__name">
      <span>{profile.personaname ?? `Player ${accountId}`}</span>
      {#if profile.steam_id}
        <a
          class="profile__steam"
          href={`https://steamcommunity.com/profiles/${profile.steam_id}/`}
          target="_blank"
          rel="noreferrer"
        >
          <img src="/image/steam_icon.png" alt="Steam" height="16" />
        </a>
      {/if}
    </div>

    <div class="profile__stats">
      <div><span class="label">WINS</span><b class="win">{statistics.wins}</b></div>
      <div><span class="label">LOSSES</span><b class="loss">{statistics.losses}</b></div>
      <div>
        <span class="label">WIN RATE</span><b class="rate"
          >{statistics.winrate.toFixed(1)}%</b
        >
      </div>
    </div>
  </div>
</div>

<style>
  .profile {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }
  .profile__avatar {
    width: 84px;
    height: 84px;
    border-radius: var(--radius);
    object-fit: cover;
  }
  .profile__name {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-strong);
    margin-bottom: var(--space-4);
  }
  .profile__stats {
    display: flex;
    gap: var(--space-8);
  }
  .profile__stats div {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .label {
    color: var(--text-muted);
    font-size: 0.7rem;
    letter-spacing: 0.05em;
  }
  .profile__stats b {
    font-size: 1.3rem;
  }
  .win {
    color: var(--success);
  }
  .loss {
    color: var(--danger);
  }
  .rate {
    color: var(--gold);
  }
</style>
